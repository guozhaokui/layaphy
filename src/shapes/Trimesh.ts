import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';
import Transform from '../math/Transform.js';
import AABB from '../collision/AABB.js';
import {Octree} from '../utils/Octree.js';

/**
 * @class Trimesh
 * @constructor
 * @param {array} vertices
 * @param {array} indices
 * @extends Shape
 * @example
 *     // How to make a mesh with a single triangle
 *     var vertices = [
 *         0, 0, 0, // vertex 0
 *         1, 0, 0, // vertex 1
 *         0, 1, 0  // vertex 2
 *     ];
 *     var indices = [
 *         0, 1, 2  // triangle 0
 *     ];
 *     var trimeshShape = new Trimesh(vertices, indices);
 */
export default class Trimesh extends Shape {
    vertices: Float32Array;
    /**
     * Array of integers, indicating which vertices each triangle consists of. The length of this array is thus 3 times the number of triangles.
     */
    indices: Int16Array;

    /**
     * The normals data.
     */
    normals: Float32Array;

    /**
     * The local AABB of the mesh.
     */
    aabb = new AABB();

    /**
     * References to vertex pairs, making up all unique edges in the trimesh.
     */
    edges:Int16Array;

    /**
     * Local scaling of the mesh. Use .setScale() to set it.
     */
    scale = new Vec3(1, 1, 1);

    /**
     * The indexed triangles. Use .updateTree() to update it.
     */
    tree = new Octree<number>();

    constructor(vertices: number[], indices: number[]) {
        super();
        this.type = SHAPETYPE.TRIMESH;
        this.vertices = new Float32Array(vertices);
        this.indices = new Int16Array(indices);
        this.normals = new Float32Array(indices.length);
        this.updateEdges();
        this.updateNormals();
        this.updateAABB();
        this.updateBoundingSphereRadius();
        this.updateTree();
    }

    /**
     * @method updateTree
     */
    updateTree() {
        const tree = this.tree;

        tree.reset();
        tree.aabb.copy(this.aabb);
        const scale = this.scale; // The local mesh AABB is scaled, but the octree AABB should be unscaled
        tree.aabb.lowerBound.x *= 1 / scale.x;
        tree.aabb.lowerBound.y *= 1 / scale.y;
        tree.aabb.lowerBound.z *= 1 / scale.z;
        tree.aabb.upperBound.x *= 1 / scale.x;
        tree.aabb.upperBound.y *= 1 / scale.y;
        tree.aabb.upperBound.z *= 1 / scale.z;

        // Insert all triangles
        const triangleAABB = new AABB();
        const a = new Vec3();
        const b = new Vec3();
        const c = new Vec3();
        const points = [a, b, c];
        for (let i = 0; i < this.indices.length / 3; i++) {
            //this.getTriangleVertices(i, a, b, c);

            // Get unscaled triangle verts
            const i3 = i * 3;
            this._getUnscaledVertex(this.indices[i3], a);
            this._getUnscaledVertex(this.indices[i3 + 1], b);
            this._getUnscaledVertex(this.indices[i3 + 2], c);

            triangleAABB.setFromPoints(points);
            tree.insert(triangleAABB, i);
        }
        tree.removeEmptyNodes();
    }

    /**
     * Get triangles in a local AABB from the trimesh.
     * @param  result An array of integers, referencing the queried triangles.
     */
    getTrianglesInAABB(aabb: AABB, result: number[]) {
        unscaledAABB.copy(aabb);

        // Scale it to local
        const scale = this.scale;
        const isx = scale.x;
        const isy = scale.y;
        const isz = scale.z;
        const l = unscaledAABB.lowerBound;
        const u = unscaledAABB.upperBound;
        l.x /= isx;
        l.y /= isy;
        l.z /= isz;
        u.x /= isx;
        u.y /= isy;
        u.z /= isz;

        return this.tree.aabbQuery(unscaledAABB, result);
    }

    setScale(scale: Vec3) {
        const wasUniform = this.scale.x === this.scale.y && this.scale.y === this.scale.z;;
        const isUniform = scale.x === scale.y && scale.y === scale.z;

        if (!(wasUniform && isUniform)) {
            // Non-uniform scaling. Need to update normals.
            this.updateNormals();
        }
        this.scale.copy(scale);
        this.updateAABB();
        this.updateBoundingSphereRadius();
    }

    /**
     * Compute the normals of the faces. Will save in the .normals array.
     * @method updateNormals
     */
    updateNormals() {
        const n = computeNormals_n;

        // Generate normals
        const normals = this.normals;
        for (let i = 0; i < this.indices.length / 3; i++) {
            const i3 = i * 3;

            const a = this.indices[i3];
            const b = this.indices[i3 + 1];
            const c = this.indices[i3 + 2];

            this.getVertex(a, va);
            this.getVertex(b, vb);
            this.getVertex(c, vc);

            Trimesh.computeNormal(vb, va, vc, n);

            normals[i3] = n.x;
            normals[i3 + 1] = n.y;
            normals[i3 + 2] = n.z;
        }
    }

    /**
     * Update the .edges property
     */
    updateEdges() {
        const edges:{[key:string]:bool} = {};
        const add = (indexA:i32, indexB:i32) => {
            const key = a < b ? `${a}_${b}` : `${b}_${a}`;
            edges[key] = true;
        };
        for (var i = 0; i < this.indices.length / 3; i++) {
            const i3 = i * 3;
            var a = this.indices[i3];
            var b = this.indices[i3 + 1];
            const c = this.indices[i3 + 2];
            add(a, b);
            add(b, c);
            add(c, a);
        }
        const keys = Object.keys(edges);
        this.edges = new Int16Array(keys.length * 2);
        for (var i = 0; i < keys.length; i++) {
            const indices = keys[i].split('_');
            this.edges[2 * i] = parseInt(indices[0], 10);
            this.edges[2 * i + 1] = parseInt(indices[1], 10);
        }
    }

    /**
     * Get an edge vertex
     * @method getEdgeVertex
     * @param   edgeIndex
     * @param   firstOrSecond 0 or 1, depending on which one of the vertices you need.
     * @param   vertexStore Where to store the result
     */
    getEdgeVertex(edgeIndex: number, firstOrSecond: number, vertexStore: Vec3) {
        const vertexIndex = this.edges[edgeIndex * 2 + (firstOrSecond ? 1 : 0)];
        this.getVertex(vertexIndex, vertexStore);
    }

    /**
     * Get a vector along an edge.
     */
    getEdgeVector(edgeIndex: number, vectorStore: Vec3) {
        const va = getEdgeVector_va;
        const vb = getEdgeVector_vb;
        this.getEdgeVertex(edgeIndex, 0, va);
        this.getEdgeVertex(edgeIndex, 1, vb);
        vb.vsub(va, vectorStore);
    }

    /**
     * Get vertex i.
     */
    getVertex(i: number, out: Vec3) {
        const scale = this.scale;
        this._getUnscaledVertex(i, out);
        out.x *= scale.x;
        out.y *= scale.y;
        out.z *= scale.z;
        return out;
    }

    /**
     * Get raw vertex i
     */
    private _getUnscaledVertex(i: number, out: Vec3) {
        const i3 = i * 3;
        const vertices = this.vertices;
        return out.set(
            vertices[i3],
            vertices[i3 + 1],
            vertices[i3 + 2]
        );
    }

    /**
     * Get a vertex from the trimesh,transformed by the given position and quaternion.
     */
    getWorldVertex(i:number, pos:Vec3, quat:Quaternion, out:Vec3) {
        this.getVertex(i, out);
        Transform.pointToWorldFrame(pos, quat, out, out);
        return out;
    }

    /**
     * Get the three vertices for triangle i.
     */
    getTriangleVertices(i:number, a:Vec3, b:Vec3, c:Vec3) {
        const i3 = i * 3;
        this.getVertex(this.indices[i3], a);
        this.getVertex(this.indices[i3 + 1], b);
        this.getVertex(this.indices[i3 + 2], c);
    }

    /**
     * Compute the normal of triangle i.
     */
    getNormal(i:number, target:Vec3) {
        const i3 = i * 3;
        return target.set(
            this.normals[i3],
            this.normals[i3 + 1],
            this.normals[i3 + 2]
        );
    }

    calculateLocalInertia(mass:number, target:Vec3) {
        // Approximate with box inertia
        // Exact inertia calculation is overkill, but see http://geometrictools.com/Documentation/PolyhedralMassProperties.pdf for the correct way to do it
        this.computeLocalAABB(cli_aabb);
        const x = cli_aabb.upperBound.x - cli_aabb.lowerBound.x;
        const y = cli_aabb.upperBound.y - cli_aabb.lowerBound.y;
        const z = cli_aabb.upperBound.z - cli_aabb.lowerBound.z;
        return target.set(
            1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * z * 2 * z),
            1.0 / 12.0 * mass * (2 * x * 2 * x + 2 * z * 2 * z),
            1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * x * 2 * x)
        );
    }

    /**
     * Compute the local AABB for the trimesh
     */
    computeLocalAABB(aabb:AABB) {
        const l = aabb.lowerBound;
        const u = aabb.upperBound;
        const n = this.vertices.length;
        //const vertices = this.vertices;
        const v = computeLocalAABB_worldVert;

        this.getVertex(0, v);
        l.copy(v);
        u.copy(v);

        for (let i = 0; i !== n; i++) {
            this.getVertex(i, v);

            if (v.x < l.x) {
                l.x = v.x;
            } else if (v.x > u.x) {
                u.x = v.x;
            }

            if (v.y < l.y) {
                l.y = v.y;
            } else if (v.y > u.y) {
                u.y = v.y;
            }

            if (v.z < l.z) {
                l.z = v.z;
            } else if (v.z > u.z) {
                u.z = v.z;
            }
        }
    }

    /**
     * Update the .aabb property
     * @method updateAABB
     */
    updateAABB() {
        this.computeLocalAABB(this.aabb);
    }

    /**
     * Will update the .boundingSphereRadius property
     * @method updateBoundingSphereRadius
     */
    updateBoundingSphereRadius() {
        // Assume points are distributed with local (0,0,0) as center
        let max2 = 0;
        const vertices = this.vertices;
        const v = new Vec3();
        for (let i = 0, N = vertices.length / 3; i !== N; i++) {
            this.getVertex(i, v);
            const norm2 = v.lengthSquared();
            if (norm2 > max2) {
                max2 = norm2;
            }
        }
        this.boundingSphereRadius = Math.sqrt(max2);
    }

    /**
     * @method calculateWorldAABB
     * @param {Vec3}        pos
     * @param {Quaternion}  quat
     * @param {Vec3}        min
     * @param {Vec3}        max
     */
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3) {
        /*
        var n = this.vertices.length / 3,
            verts = this.vertices;
        var minx,miny,minz,maxx,maxy,maxz;

        var v = tempWorldVertex;
        for(var i=0; i<n; i++){
            this.getVertex(i, v);
            quat.vmult(v, v);
            pos.vadd(v, v);
            if (v.x < minx || minx===undefined){
                minx = v.x;
            } else if(v.x > maxx || maxx===undefined){
                maxx = v.x;
            }

            if (v.y < miny || miny===undefined){
                miny = v.y;
            } else if(v.y > maxy || maxy===undefined){
                maxy = v.y;
            }

            if (v.z < minz || minz===undefined){
                minz = v.z;
            } else if(v.z > maxz || maxz===undefined){
                maxz = v.z;
            }
        }
        min.set(minx,miny,minz);
        max.set(maxx,maxy,maxz);
        */

        // Faster approximation using local AABB
        const frame = calculateWorldAABB_frame;
        const result = calculateWorldAABB_aabb;
        frame.position = pos;
        frame.quaternion = quat;
        this.aabb.toWorldFrame(frame, result);
        min.copy(result.lowerBound);
        max.copy(result.upperBound);
    }

    /**
     * Get approximate volume
     */
    volume() {
        return 4.0 * Math.PI * this.boundingSphereRadius / 3.0;
    }

    /**
     * Get face normal given 3 vertices
     */
    static computeNormal(va: Vec3, vb: Vec3, vc: Vec3, target: Vec3) {
        vb.vsub(va, ab);
        vc.vsub(vb, cb);
        cb.cross(ab, target);
        if (!target.isZero()) {
            target.normalize();
        }
    }


    /**
     * Create a Trimesh instance, shaped as a torus.
     */
    createTorus(
        radius = 1,
        tube = 0.5,
        radialSegments = 8,
        tubularSegments = 6,
        arc = Math.PI * 2
    ) {
        const vertices = [];
        const indices = [];

        for (var j = 0; j <= radialSegments; j++) {
            for (var i = 0; i <= tubularSegments; i++) {
                const u = i / tubularSegments * arc;
                const v = j / radialSegments * Math.PI * 2;

                const x = (radius + tube * Math.cos(v)) * Math.cos(u);
                const y = (radius + tube * Math.cos(v)) * Math.sin(u);
                const z = tube * Math.sin(v);

                vertices.push(x, y, z);
            }
        }

        for (var j = 1; j <= radialSegments; j++) {
            for (var i = 1; i <= tubularSegments; i++) {
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        return new Trimesh(vertices, indices);
    }


}

var computeNormals_n = new Vec3();
var unscaledAABB = new AABB();
var getEdgeVector_va = new Vec3();
var getEdgeVector_vb = new Vec3();


const cb = new Vec3();
const ab = new Vec3();

var va = new Vec3();
var vb = new Vec3();
var vc = new Vec3();

var cli_aabb = new AABB();

var computeLocalAABB_worldVert = new Vec3();

//const tempWorldVertex = new Vec3();
var calculateWorldAABB_frame = new Transform();
var calculateWorldAABB_aabb = new AABB();
