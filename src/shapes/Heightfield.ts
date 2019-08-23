import Shape, { SHAPETYPE } from './Shape.js';
import ConvexPolyhedron from './ConvexPolyhedron.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';
import AABB from '../collision/AABB.js';

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a given distance.
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {Array} data An array of Y values that will be used to construct the terrain.
 * @param {object} options
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementSize=0.1] World spacing between the data points in X direction.
 * @todo Should be possible to use along all axes, not just y
 * @todo should be possible to scale along all axes
 *
 * @example
 *     // Generate some height data (y-values).
 *     var data = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         data.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var heightfieldShape = new Heightfield(data, {
 *         elementSize: 1 // Distance between the data points in X and Y directions
 *     });
 *     var heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 */
export default class Heightfield extends Shape {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     */
    data: f32[][];

    /**
     * Max value of the data
     */
    maxValue: f32;

    /**
     * Max value of the data
     */
    minValue: f32;

    /**
     * The width of each element
     * 每个格子的宽度
     * @todo elementSizeX and Y
     */
    elementSize: f32=1;

    cacheEnabled = true;

    pillarConvex = new ConvexPolyhedron();
    pillarOffset = new Vec3();

    _cachedPillars:{[key:string]:{convex:ConvexPolyhedron,offset:Vec3}} = {};

    constructor(data: number[][], minValue:number|null|undefined, maxValue:number|null|undefined, elementSize:number) {
        super();
        this.type = SHAPETYPE.HEIGHTFIELD;

        this.data = data;
        this.elementSize = elementSize;

        if (minValue === null || minValue===undefined) {
            this.updateMinValue();
        }else{
            this.minValue=minValue;
        }
        if (maxValue === null || maxValue===undefined) {
            this.updateMaxValue();
        }else{
            this.minValue=maxValue;
        }
        this.updateBoundingSphereRadius();
        this._cachedPillars = {};
    }

    /**
     * Call whenever you change the data array.
     */
    update() {
        this._cachedPillars = {};
    }

    /**
     * Update the .minValue property
     */
    updateMinValue() {
        const data = this.data;
        let minValue = data[0][0];
        for (let i = 0; i !== data.length; i++) {
            for (let j = 0; j !== data[i].length; j++) {
                const v = data[i][j];
                if (v < minValue) {
                    minValue = v;
                }
            }
        }
        this.minValue = minValue;
    }

    /**
     * Update the .maxValue property
     * @method updateMaxValue
     */
    updateMaxValue() {
        const data = this.data;
        let maxValue = data[0][0];
        for (let i = 0; i !== data.length; i++) {
            for (let j = 0; j !== data[i].length; j++) {
                const v = data[i][j];
                if (v > maxValue) {
                    maxValue = v;
                }
            }
        }
        this.maxValue = maxValue;
    }

    /**
     * Set the height value at an index. Don't forget to update maxValue and minValue after you're done.
     */
    setHeightValueAtIndex(xi:number, yi:number, value:number) {
        const data = this.data;
        data[xi][yi] = value;

        // Invalidate cache
        this.clearCachedConvexTrianglePillar(xi, yi, false);
        if (xi > 0) {
            this.clearCachedConvexTrianglePillar(xi - 1, yi, true);
            this.clearCachedConvexTrianglePillar(xi - 1, yi, false);
        }
        if (yi > 0) {
            this.clearCachedConvexTrianglePillar(xi, yi - 1, true);
            this.clearCachedConvexTrianglePillar(xi, yi - 1, false);
        }
        if (yi > 0 && xi > 0) {
            this.clearCachedConvexTrianglePillar(xi - 1, yi - 1, true);
        }
    }

    /**
     * Get max/min in a rectangle in the matrix data
     * @param   [result] An array to store the results in.
     * @return  The result array, if it was passed in. Minimum will be at position 0 and max at 1.
     */
    getRectMinMax(iMinX:number, iMinY:number, iMaxX:number, iMaxY:number, result:f32[] = []) {
        // Get max and min of the data
        const data = this.data; // Set first value

        let max = this.minValue;
        for (let i = iMinX; i <= iMaxX; i++) {
            for (let j = iMinY; j <= iMaxY; j++) {
                const height = data[i][j];
                if (height > max) {
                    max = height;
                }
            }
        }

        result[0] = this.minValue;
        result[1] = max;
    }

    /**
     * Get the index of a local position on the heightfield. The indexes indicate the rectangles, so if your terrain is made of N x N height data points, you will have rectangle indexes ranging from 0 to N-1.
     * @param   result Two-element array
     * @param   clamp If the position should be clamped to the heightfield edge.
     * @return 
     */
    getIndexOfPosition(x:number, y:number, result:number[], clamp:bool) {

        // Get the index of the data points to test against
        const w = this.elementSize;
        const data = this.data;
        let xi = Math.floor(x / w);
        let yi = Math.floor(y / w);

        result[0] = xi;
        result[1] = yi;

        if (clamp) {
            // Clamp index to edges
            if (xi < 0) { xi = 0; }
            if (yi < 0) { yi = 0; }
            if (xi >= data.length - 1) { xi = data.length - 1; }
            if (yi >= data[0].length - 1) { yi = data[0].length - 1; }
        }

        // Bail out if we are out of the terrain
        if (xi < 0 || yi < 0 || xi >= data.length - 1 || yi >= data[0].length - 1) {
            return false;
        }

        return true;
    }

    getTriangleAt(x:f32, y:f32, edgeClamp:bool, a:Vec3, b:Vec3, c:Vec3):bool {
        const idx = getHeightAt_idx;
        this.getIndexOfPosition(x, y, idx, edgeClamp);
        let xi = idx[0];
        let yi = idx[1];

        const data = this.data;
        if (edgeClamp) {
            xi = Math.min(data.length - 2, Math.max(0, xi));
            yi = Math.min(data[0].length - 2, Math.max(0, yi));
        }

        const elementSize = this.elementSize;
        const lowerDist2 = (x / elementSize - xi) ** 2 + (y / elementSize - yi) ** 2;
        const upperDist2 = (x / elementSize - (xi + 1)) ** 2 + (y / elementSize - (yi + 1)) ** 2;
        const upper = lowerDist2 > upperDist2;
        this.getTriangle(xi, yi, upper, a, b, c);
        return upper;
    }

    getNormalAt(x:f32, y:f32, edgeClamp:bool, result:Vec3) {
        const a = getNormalAt_a;
        const b = getNormalAt_b;
        const c = getNormalAt_c;
        const e0 = getNormalAt_e0;
        const e1 = getNormalAt_e1;
        this.getTriangleAt(x, y, edgeClamp, a, b, c);
        b.vsub(a, e0);
        c.vsub(a, e1);
        e0.cross(e1, result);
        result.normalize();
    }

    /**
     * Get an AABB of a square in the heightfield
     * @param  {number} xi
     * @param  {number} yi
     * @param  {AABB} result
     */
    getAabbAtIndex(xi:i32, yi:i32, result:AABB):void {
        const data = this.data;
        const elementSize = this.elementSize;

        result.lowerBound.set(
            xi * elementSize,
            yi * elementSize,
            data[xi][yi]
        );
        result.upperBound.set(
            (xi + 1) * elementSize,
            (yi + 1) * elementSize,
            data[xi + 1][yi + 1]
        );
    }

    /**
     * Get the height in the heightfield at a given position
     * @param  {number} x
     * @param  {number} y
     * @param  {boolean} edgeClamp
     * @return {number}
     */
    getHeightAt(x:f32, y:f32, edgeClamp:bool) {
        const data = this.data;
        const a = getHeightAt_a;
        const b = getHeightAt_b;
        const c = getHeightAt_c;
        const idx = getHeightAt_idx;

        this.getIndexOfPosition(x, y, idx, edgeClamp);
        let xi = idx[0];
        let yi = idx[1];
        if (edgeClamp) {
            xi = Math.min(data.length - 2, Math.max(0, xi));
            yi = Math.min(data[0].length - 2, Math.max(0, yi));
        }
        const upper = this.getTriangleAt(x, y, edgeClamp, a, b, c);
        barycentricWeights(x, y, a.x, a.y, b.x, b.y, c.x, c.y, getHeightAt_weights);

        const w = getHeightAt_weights;

        if (upper) {

            // Top triangle verts
            return data[xi + 1][yi + 1] * w.x + data[xi][yi + 1] * w.y + data[xi + 1][yi] * w.z;

        } else {

            // Top triangle verts
            return data[xi][yi] * w.x + data[xi + 1][yi] * w.y + data[xi][yi + 1] * w.z;
        }
    }

    getCacheConvexTrianglePillarKey(xi:number, yi:number, getUpperTriangle:boolean):string {
        return `${xi}_${yi}_${getUpperTriangle ? 1 : 0}`;
    }

    getCachedConvexTrianglePillar(xi:number, yi:number, getUpperTriangle:boolean) {
        return this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
    }

    setCachedConvexTrianglePillar(xi:number, yi:number, getUpperTriangle:boolean, convex:ConvexPolyhedron, offset:Vec3) {
        this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)] = {
            convex,
            offset
        };
    }

    clearCachedConvexTrianglePillar(xi:number, yi:number, getUpperTriangle:boolean) {
        delete this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
    }

    /**
     * Get a triangle from the heightfield
     */
    getTriangle(xi:number, yi:number, upper:boolean, a:Vec3, b:Vec3, c:Vec3) {
        const data = this.data;
        const elementSize = this.elementSize;

        if (upper) {

            // Top triangle verts
            a.set(
                (xi + 1) * elementSize,
                (yi + 1) * elementSize,
                data[xi + 1][yi + 1]
            );
            b.set(
                xi * elementSize,
                (yi + 1) * elementSize,
                data[xi][yi + 1]
            );
            c.set(
                (xi + 1) * elementSize,
                yi * elementSize,
                data[xi + 1][yi]
            );

        } else {

            // Top triangle verts
            a.set(
                xi * elementSize,
                yi * elementSize,
                data[xi][yi]
            );
            b.set(
                (xi + 1) * elementSize,
                yi * elementSize,
                data[xi + 1][yi]
            );
            c.set(
                xi * elementSize,
                (yi + 1) * elementSize,
                data[xi][yi + 1]
            );
        }
    }

    /**
     * Get a triangle in the terrain in the form of a triangular convex shape.
     * 把地形转成一个convex
     * xi,yi定位到data中的索引
     */
    getConvexTrianglePillar(xi:i32, yi:i32, getUpperTriangle:boolean) {
        let result = this.pillarConvex;
        let offsetResult = this.pillarOffset;

        debugger;
        if (this.cacheEnabled) {
            let data = this.getCachedConvexTrianglePillar(xi, yi, getUpperTriangle);
            if (data) {
                this.pillarConvex = data.convex;
                this.pillarOffset = data.offset;
                return;
            }

            result = new ConvexPolyhedron();
            offsetResult = new Vec3();

            this.pillarConvex = result;
            this.pillarOffset = offsetResult;
        }

        let data = this.data;
        const elementSize = this.elementSize;
        const faces = result.faces;

        // Reuse verts if possible
        // 多面体有6个顶点
        result.vertices.length = 6;
        for (var i = 0; i < 6; i++) {
            if (!result.vertices[i]) {
                result.vertices[i] = new Vec3();
            }
        }

        // Reuse faces if possible
        // 多面体有5个面
        faces.length = 5;
        for (var i = 0; i < 5; i++) {
            if (!faces[i]) {
                faces[i] = [];  // 每个面的多边形索引
            }
        }

        const verts = result.vertices;

        const h = (Math.min(
            data[xi][yi],
            data[xi + 1][yi],
            data[xi][yi + 1],
            data[xi + 1][yi + 1]
        ) - this.minValue) / 2 + this.minValue;

        if (!getUpperTriangle) {
            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set(
                (xi + 0.25) * elementSize, // sort of center of a triangle
                (yi + 0.25) * elementSize,
                h // vertical center
            );

            // Top triangle verts
            verts[0].set(
                -0.25 * elementSize,
                -0.25 * elementSize,
                data[xi][yi] - h
            );
            verts[1].set(
                0.75 * elementSize,
                -0.25 * elementSize,
                data[xi + 1][yi] - h
            );
            verts[2].set(
                -0.25 * elementSize,
                0.75 * elementSize,
                data[xi][yi + 1] - h
            );

            // bottom triangle verts
            verts[3].set(
                -0.25 * elementSize,
                -0.25 * elementSize,
                -h - 1
            );
            verts[4].set(
                0.75 * elementSize,
                -0.25 * elementSize,
                -h - 1
            );
            verts[5].set(
                -0.25 * elementSize,
                0.75 * elementSize,
                -h - 1
            );

            // top triangle
            faces[0][0] = 0;
            faces[0][1] = 1;
            faces[0][2] = 2;

            // bottom triangle
            faces[1][0] = 5;
            faces[1][1] = 4;
            faces[1][2] = 3;

            // -x facing quad
            faces[2][0] = 0;
            faces[2][1] = 2;
            faces[2][2] = 5;
            faces[2][3] = 3;

            // -y facing quad
            faces[3][0] = 1;
            faces[3][1] = 0;
            faces[3][2] = 3;
            faces[3][3] = 4;

            // +xy facing quad
            faces[4][0] = 4;
            faces[4][1] = 5;
            faces[4][2] = 2;
            faces[4][3] = 1;


        } else {

            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set(
                (xi + 0.75) * elementSize, // sort of center of a triangle
                (yi + 0.75) * elementSize,
                h // vertical center
            );

            // Top triangle verts
            verts[0].set(
                0.25 * elementSize,
                0.25 * elementSize,
                data[xi + 1][yi + 1] - h
            );
            verts[1].set(
                -0.75 * elementSize,
                0.25 * elementSize,
                data[xi][yi + 1] - h
            );
            verts[2].set(
                0.25 * elementSize,
                -0.75 * elementSize,
                data[xi + 1][yi] - h
            );

            // bottom triangle verts
            verts[3].set(
                0.25 * elementSize,
                0.25 * elementSize,
                - h - 1
            );
            verts[4].set(
                -0.75 * elementSize,
                0.25 * elementSize,
                - h - 1
            );
            verts[5].set(
                0.25 * elementSize,
                -0.75 * elementSize,
                - h - 1
            );

            // Top triangle
            faces[0][0] = 0;
            faces[0][1] = 1;
            faces[0][2] = 2;

            // bottom triangle
            faces[1][0] = 5;
            faces[1][1] = 4;
            faces[1][2] = 3;

            // +x facing quad
            faces[2][0] = 2;
            faces[2][1] = 5;
            faces[2][2] = 3;
            faces[2][3] = 0;

            // +y facing quad
            faces[3][0] = 3;
            faces[3][1] = 4;
            faces[3][2] = 1;
            faces[3][3] = 0;

            // -xy facing quad
            faces[4][0] = 1;
            faces[4][1] = 4;
            faces[4][2] = 5;
            faces[4][3] = 2;
        }

        result.computeNormals();
        result.computeEdges();
        result.updateBoundingSphereRadius();

        this.setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, result, offsetResult);
    }

    calculateLocalInertia(mass:number, target = new Vec3()) {
        target.set(0, 0, 0);
        return target;
    }

    volume() {
        return Number.MAX_VALUE; // The terrain is infinite
    }

    calculateWorldAABB(pos:Vec3, quat:Quaternion, min:Vec3, max:Vec3) {
        // TODO: do it properly
        min.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        max.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    }

    updateBoundingSphereRadius() {
        // Use the bounding box of the min/max values
        const data = this.data;

        const s = this.elementSize;
        this.boundingSphereRadius = new Vec3(data.length * s, data[0].length * s, Math.max(Math.abs(this.maxValue), Math.abs(this.minValue))).length();
    }

    /**
     * Sets the height values from an image. Currently only supported in browser.
     */
    setHeightsFromImage(image:any, scale:Vec3) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if(!context){
            console.error('get context 2d error');
            return;
        }
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);

        const matrix = this.data;
        matrix.length = 0;
        this.elementSize = Math.abs(scale.x) / imageData.width;
        for (let i = 0; i < imageData.height; i++) {
            const row = [];
            for (let j = 0; j < imageData.width; j++) {
                const a = imageData.data[(i * imageData.height + j) * 4];
                const b = imageData.data[(i * imageData.height + j) * 4 + 1];
                const c = imageData.data[(i * imageData.height + j) * 4 + 2];
                const height = (a + b + c) / 4 / 255 * scale.z;
                if (scale.x < 0) {
                    row.push(height);
                } else {
                    row.unshift(height);
                }
            }
            if (scale.y < 0) {
                matrix.unshift(row);
            } else {
                matrix.push(row);
            }
        }
        this.updateMaxValue();
        this.updateMinValue();
        this.update();
    }
}


var getHeightAt_idx:i32[] = [];
var getHeightAt_weights = new Vec3();
var getHeightAt_a = new Vec3();
var getHeightAt_b = new Vec3();
var getHeightAt_c = new Vec3();

var getNormalAt_a = new Vec3();
var getNormalAt_b = new Vec3();
var getNormalAt_c = new Vec3();
var getNormalAt_e0 = new Vec3();
var getNormalAt_e1 = new Vec3();

// from https://en.wikipedia.org/wiki/Barycentric_coordinate_system
function barycentricWeights(x:f32, y:f32, ax:f32, ay:f32, bx:f32, by:f32, cx:f32, cy:f32, result:Vec3) {
    result.x = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
    result.y = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
    result.z = 1 - result.x - result.y;
}