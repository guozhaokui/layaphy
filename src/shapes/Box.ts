import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import ConvexPolyhedron from './ConvexPolyhedron.js';
import Quaternion from '../math/Quaternion.js';

export function quat_AABBExt_mult(q:Quaternion, v:Vec3, target = new Vec3()) {
    const {x,y,z} = v;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    let qx2=qx*qx, qy2=qy*qy, qz2=qz*qz, qw2=qw*qw;
    let xy=2*qx*qy,zw=2*qz*qw,yw=2*qy*qw,xw=2*qx*qw,xz=2*qx*qz,yz=2*qy*qz;
    // q*v
    //const ix = qw * x + qy * z - qz * y;
    //const iy = qw * y + qz * x - qx * z;
    //const iz = qw * z + qx * y - qy * x;
    //const iw = -qx * x - qy * y - qz * z;

    //target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    //target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    //target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    // 其实就相当于把四元数转成矩阵了
    //(qw*x - qz*y + qy*z )*qw + (qx*x + qy*y + qz*z)*qx - (qz*x + qw*y  - qx*z)*qz + (-qy*x + qx*y + qw*z  )*qy
    // Math.abs((qw*qw + qx*qx - qz*qz -qy*qy)*x) +Math.abs(( 2*qx*qy -2*qz*qw)*y) + Math.abs((2*qy*qw + 2*qx*qz )*z);
    target.x = Math.abs((qw2 + qx2 - qz2 -qy2)*x) +Math.abs(( xy -zw)*y) + Math.abs((yw + xz )*z);
    //(qw*y + qz*x - qx*z)*qw + (-qx*x - qy*y - qz*z)*-qy + (qw*z + qx*y - qy*x)*-qx + (qw*x + qy*z - qz*y)*qz
    //target.y = Math.abs((2*qz*qw +2*qx*qy)*x) + Math.abs((qw*qw +qy*qy -qx*qx -qz*qz)*y) + Math.abs((-2*qx*qw +2*qy*qz)*z);
    target.y = Math.abs((zw +xy)*x) + Math.abs((qw2 +qy2 -qx2 -qz2)*y) + Math.abs((-xw +yz)*z);
    //(qw * z + qx * y - qy * x) * qw + (qx * x + qy * y + qz * z) * qz + (-qw * x - qy * z + qz * y) * qy + (qw * y + qz * x - qx * z) * qx;
    //target.z = Math.abs((-2*qy*qw   +2*qx*qz)*x) + Math.abs((2*qx*qw  +2*qy*qz ) *y) +  Math.abs((qw2 +qz2 -qy2 -qx2)*z);
    target.z = Math.abs((-yw   +xz)*x) + Math.abs((xw  +yz ) *y) +  Math.abs((qw2 +qz2 -qy2 -qx2)*z);

    return target;
}    


/**
 * A 3d box shape.
 */
export default class Box extends Shape {
    halfExtents: Vec3;

    /**
     * Used by the contact generator to make contacts with other convex polyhedra for example
     * 把BOX转成convex
     */
    convexPolyhedronRepresentation:ConvexPolyhedron;

    constructor(halfExtents: Vec3) {
        super();
        this.type = SHAPETYPE.BOX;
        this.halfExtents = halfExtents;
        this.updateConvexPolyhedronRepresentation();
        this.updateBoundingSphereRadius();
    }

    /**
     * Updates the local convex polyhedron representation used for some collisions.
     */
    updateConvexPolyhedronRepresentation() {
        const sx = this.halfExtents.x;
        const sy = this.halfExtents.y;
        const sz = this.halfExtents.z;
        const V = Vec3;

        const vertices = [
            new V(-sx, -sy, -sz),
            new V(sx, -sy, -sz),
            new V(sx, sy, -sz),
            new V(-sx, sy, -sz),
            new V(-sx, -sy, sz),
            new V(sx, -sy, sz),
            new V(sx, sy, sz),
            new V(-sx, sy, sz)
        ];

        const indices = [
            [3, 2, 1, 0], // -z
            [4, 5, 6, 7], // +z
            [5, 4, 0, 1], // -y
            [2, 3, 7, 6], // +y
            [0, 4, 7, 3], // -x
            [1, 2, 6, 5], // +x
        ];

        /*
        const axes = [
            new V(0, 0, 1),
            new V(0, 1, 0),
            new V(1, 0, 0)
        ];
        */

        const h = new ConvexPolyhedron(vertices, indices);
        this.convexPolyhedronRepresentation = h;
        h.material = this.material;
    }

    calculateLocalInertia(mass: number, target = new Vec3()) {
        Box.calculateInertia(this.halfExtents, mass, target);
        return target;
    }

    /**
     * Get the box 6 side normals
     * @param       sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
     * @param quat             Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
     */
    getSideNormals(sixTargetVectors: Vec3[], quat: Quaternion) {
        const sides = sixTargetVectors;
        const ex = this.halfExtents;
        sides[0].set(ex.x, 0, 0);
        sides[1].set(0, ex.y, 0);
        sides[2].set(0, 0, ex.z);
        sides[3].set(-ex.x, 0, 0);
        sides[4].set(0, -ex.y, 0);
        sides[5].set(0, 0, -ex.z);

        if (quat !== undefined) {
            for (let i = 0; i !== sides.length; i++) {
                quat.vmult(sides[i], sides[i]);
            }
        }

        return sides;
    }

    volume() {
        return 8.0 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
    }

    updateBoundingSphereRadius() {
        this.boundingSphereRadius = this.halfExtents.length();
    }

    forEachWorldCorner(pos: Vec3, quat: Quaternion, callback: (x: number, y: number, z: number) => void) {
        const e = this.halfExtents;
        const corners = [[e.x, e.y, e.z],
        [-e.x, e.y, e.z],
        [-e.x, -e.y, e.z],
        [-e.x, -e.y, -e.z],
        [e.x, -e.y, -e.z],
        [e.x, e.y, -e.z],
        [-e.x, e.y, -e.z],
        [e.x, -e.y, e.z]];
        for (let i = 0; i < corners.length; i++) {
            worldCornerTempPos.set(corners[i][0], corners[i][1], corners[i][2]);
            quat.vmult(worldCornerTempPos, worldCornerTempPos);
            pos.vadd(worldCornerTempPos, worldCornerTempPos);
            callback(worldCornerTempPos.x,
                worldCornerTempPos.y,
                worldCornerTempPos.z);
        }
    }

    /*
    private _rotateExtents(extents:Vector3, rotation:Matrix4x4, out:Vector3):void {
        var extentsX:number = extents.x;
        var extentsY:number = extents.y;
        var extentsZ:number = extents.z;
        var matElements:Float32Array = rotation.elements;
        out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
        out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
        out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
    } 
    */   


    static boxext1=new Vec3();
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3) {
        const e = this.halfExtents;
        let newext = Box.boxext1;
        quat_AABBExt_mult(quat,e,newext);
        pos.vsub(newext,min);
        pos.vadd(newext,max);
        return ;
        /*
        worldCornersTemp[0].set(e.x, e.y, e.z);
        worldCornersTemp[1].set(-e.x, e.y, e.z);
        worldCornersTemp[2].set(-e.x, -e.y, e.z);
        worldCornersTemp[3].set(-e.x, -e.y, -e.z);
        worldCornersTemp[4].set(e.x, -e.y, -e.z);
        worldCornersTemp[5].set(e.x, e.y, -e.z);
        worldCornersTemp[6].set(-e.x, e.y, -e.z);
        worldCornersTemp[7].set(e.x, -e.y, e.z);

        var wc = worldCornersTemp[0];
        quat.vmult(wc, wc);
        pos.vadd(wc, wc);
        max.copy(wc);
        min.copy(wc);
        for (let i = 1; i < 8; i++) {
            var wc = worldCornersTemp[i];
            quat.vmult(wc, wc);
            pos.vadd(wc, wc);
            const x = wc.x;
            const y = wc.y;
            const z = wc.z;
            if (x > max.x) {
                max.x = x;
            }
            if (y > max.y) {
                max.y = y;
            }
            if (z > max.z) {
                max.z = z;
            }

            if (x < min.x) {
                min.x = x;
            }
            if (y < min.y) {
                min.y = y;
            }
            if (z < min.z) {
                min.z = z;
            }
        }
        */
    }

    static calculateInertia(halfExtents: Vec3, mass: number, target: Vec3) {
        const e = halfExtents;
        target.x = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z);
        target.y = 1.0 / 12.0 * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z);
        target.z = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x);
    }
}


var worldCornerTempPos = new Vec3();
//const worldCornerTempNeg = new Vec3();
/*
var worldCornersTemp = [
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec3()
];
*/