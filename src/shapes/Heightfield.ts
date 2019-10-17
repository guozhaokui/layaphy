import {Shape,  SHAPETYPE } from './Shape.js';
import {ConvexPolyhedron} from './ConvexPolyhedron.js';
import {Vec3} from '../math/Vec3.js';
import {Quaternion} from '../math/Quaternion.js';
import {AABB} from '../collision/AABB.js';

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
export class Heightfield extends Shape {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     */
    data: f32[][];	// 二维数组

    minValue: f32;	// 最低值
    maxValue: f32;	// 最高值

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
        this.updateBndSphR();
        this._cachedPillars = {};
    }

    /**
     * Call whenever you change the data array.
     */
    update() {
        this._cachedPillars = {};
	}
	
    onPreNarrowpase(stepId: number,pos:Vec3,quat:Quaternion): void {

	}

    /**
     * Update the .minValue property
     */
    updateMinValue() {
        const data = this.data;
        let minValue = data[0][0];
        for (let i = 0,yl=data.length; i<yl; i++) {
            for (let j = 0,xl=data[i].length; j < xl; j++) {
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
        data[yi][xi] = value;

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
		for (let j = iMinY; j <= iMaxY; j++) {
			for (let i = iMinX; i <= iMaxX; i++) {
                const height = data[j][i];
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
	 * 根据空间位置来确定对应的数据的位置
     * @param   result Two-element array
     * @param   clamp If the position should be clamped to the heightfield edge.
     * @return 如果不在范围内，则false
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
            if (yi >= data.length - 1) { yi = data.length - 1; }
            if (xi >= data[0].length - 1) { xi = data[0].length - 1; }
        }

        // Bail out if we are out of the terrain
        if (xi < 0 || yi < 0 || yi >= data.length - 1 || xi >= data[0].length - 1) {
            return false;
        }

        return true;
    }

    /**
     * 返回x,y所在位置的三角形，返回三角形的三个点
     * @param x 
     * @param y 
     * @param edgeClamp 
     * @param a 
     * @param b 
     * @param c 
     * 返回是否在上半三角形
     */
    getTriangleAt(x:f32, y:f32, edgeClamp:bool, a:Vec3, b:Vec3, c:Vec3):bool {
        const idx = getHeightAt_idx;
        this.getIndexOfPosition(x, y, idx, edgeClamp);
        let xi = idx[0];
        let yi = idx[1];

        const data = this.data;
        if (edgeClamp) {
            yi = Math.min(data.length - 2, Math.max(0, yi));
            xi = Math.min(data[0].length - 2, Math.max(0, xi));
        }

        const elementSize = this.elementSize;
        // 落点到左上角的距离
        const upperDist2 = (x / elementSize - xi) ** 2 + (y / elementSize - yi) ** 2;
        // 落点到右下角的距离
        const lowerDist2 = (x / elementSize - (xi + 1)) ** 2 + (y / elementSize - (yi + 1)) ** 2;

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

    getNormal(x:int, y:int, result:Vec3) {
        const a = getNormalAt_a;
        const b = getNormalAt_b;
        const c = getNormalAt_c;
        const e0 = getNormalAt_e0;
        const e1 = getNormalAt_e1;
        this.getTriangleAt(x, y, true, a, b, c);
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
            data[yi][xi],
            yi * elementSize
        );
        result.upperBound.set(
            (xi + 1) * elementSize,
            data[yi + 1][xi + 1],
            (yi + 1) * elementSize
        );
    }

    /**
     * Get the height in the heightfield at a given position
	 * 获取xy位置的高度
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
            yi = Math.min(data.length - 2, Math.max(0, yi));
            xi = Math.min(data[0].length - 2, Math.max(0, xi));
        }
        const upper = this.getTriangleAt(x, y, edgeClamp, a, b, c);
        barycentricWeights(x, y, a.x, a.z, b.x, b.z, c.x, c.z, getHeightAt_weights);

        const w = getHeightAt_weights;

        if (upper) {
            //TODO 验证
            // Top triangle verts
            return data[yi + 1][xi + 1] * w.x + data[yi][xi + 1] * w.y + data[yi + 1][xi] * w.z;

        } else {

            // Top triangle verts
            return data[yi][xi] * w.x + data[yi + 1][xi] * w.y + data[yi][xi + 1] * w.z;
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

	// 返回d。注意这里的平面公式是 n.p=d,而不是 n.p+d=0
	getPlane(xi:int,yi:int,upper:boolean,a:Vec3,b:Vec3,c:Vec3,norm:Vec3):number{
		this.getTriangle(xi,yi,upper, a,b,c);
		let e0 = getPlane_e0;
		let e1 = getPlane_e1;
        b.vsub(a, e0);
        c.vsub(a, e1);
        e0.cross(e1, norm);
		norm.normalize();
		//d 是平面任意一点与法线的点积 norm.p = d
		return a.dot(norm);
	}
    /**
     * Get a triangle from the heightfield
     */
    getTriangle(xi:int, yi:int, upper:boolean, a:Vec3, b:Vec3, c:Vec3) {
        const data = this.data;
        const elementSize = this.elementSize;

        if (upper) {
            // Top triangle verts
            a.set(
                xi * elementSize,
                data[yi][xi],
                yi * elementSize
            );
            b.set(
                (xi + 1) * elementSize,
                data[yi + 1][xi],
                yi * elementSize
            );
            c.set(
                xi * elementSize,
                data[yi][xi + 1],
                (yi + 1) * elementSize
            );

        } else {
            // Top triangle verts
            a.set(
                (xi + 1) * elementSize,
                data[yi + 1][xi + 1],
                (yi + 1) * elementSize
            );
            b.set(
                xi * elementSize,
                data[yi][xi + 1],
                (yi + 1) * elementSize
            );
            c.set(
                (xi + 1) * elementSize,
                data[yi + 1][xi],
                yi * elementSize
            );
        }
    }

    /**
     * Get a triangle in the terrain in the form of a triangular convex shape.
     * 把xy位置的地块转成一个convex，保存到 this.pllarConvex中
     * xi,yi定位到data中的索引
     */
    getConvexTrianglePillar(xi:i32, yi:i32, getUpperTriangle:boolean) {
        let result = this.pillarConvex;
        let offsetResult = this.pillarOffset;

        if (this.cacheEnabled) {
			// 检查是否有缓存
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
		// 多面体是一个三棱柱，有6个顶点，5个面
        result.vertices.length = 6;
        for (var i = 0; i < 6; i++) {
            if (!result.vertices[i]) {
                result.vertices[i] = new Vec3();
            }
        }

        // Reuse faces if possible
        faces.length = 5;
        for (var i = 0; i < 5; i++) {
            if (!faces[i]) {
                faces[i] = [];  // 每个面的多边形索引
            }
        }

        const verts = result.vertices;

		// 四个点的最低点到整体最低点的中点
        const h = (Math.min(
            data[yi][xi],
            data[yi + 1][xi],
            data[yi][xi + 1],
            data[yi + 1][xi + 1]
        ) - this.minValue) / 2 + this.minValue;

        if (getUpperTriangle) {
            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set(
                (xi + 0.25) * elementSize, // sort of center of a triangle
                h, // vertical center
                (yi + 0.25) * elementSize
            );

			// Top triangle verts
			// 0        1
			//  *-----*
			//  | . /  . 是offsetResult
			//  | /
			//  *  
			// 2
            verts[0].set(
                -0.25 * elementSize,	// 相对于offsetResult，所以是 -0.25,-0.25
                data[yi][xi] - h,
                -0.25 * elementSize
            );
            verts[1].set(
                0.75 * elementSize,
                data[yi][xi+1] - h,
                -0.25 * elementSize
            );
            verts[2].set(
                -0.25 * elementSize,
                data[yi+1][xi] - h,
                0.75 * elementSize
            );

            // bottom triangle verts
            verts[3].set(
                -0.25 * elementSize,
                -h - 1,		// 本来是-h， -1是为了加厚么?
                -0.25 * elementSize
            );
            verts[4].set(
                0.75 * elementSize,
                -h - 1,
                -0.25 * elementSize
            );
            verts[5].set(
                -0.25 * elementSize,
                -h - 1,
                0.75 * elementSize
            );

            // top triangle
            faces[0][0] = 1;
            faces[0][1] = 0;
            faces[0][2] = 2;

            // bottom triangle
            faces[1][0] = 3;
            faces[1][1] = 4;
            faces[1][2] = 5;

            // -x facing quad
            faces[2][0] = 2;
            faces[2][1] = 0;
            faces[2][2] = 3;
            faces[2][3] = 5;

            // -y facing quad
            faces[3][0] = 0;
            faces[3][1] = 1;
            faces[3][2] = 4;
            faces[3][3] = 3;

            // +xy facing quad
            faces[4][0] = 1;
            faces[4][1] = 2;
            faces[4][2] = 5;
            faces[4][3] = 4;


        } else {
			//         2
			//        *
			//      / | 
			//    / . | 是offsetResult
			//  * --- *
			//  1      0
            // Center of the triangle pillar - all polygons are given relative to this one
            offsetResult.set(
                (xi + 0.75) * elementSize, // sort of center of a triangle
                h, // vertical center
                (yi + 0.75) * elementSize
            );

            // Top triangle verts
            verts[0].set(
                0.25 * elementSize,
                data[yi + 1][xi + 1] - h,
                0.25 * elementSize
            );
            verts[1].set(
                -0.75 * elementSize,
                data[yi+1][xi] - h,
                0.25 * elementSize
            );
            verts[2].set(
                0.25 * elementSize,
                data[yi][xi+1] - h,
                -0.75 * elementSize
            );

            // bottom triangle verts
            verts[3].set(
                0.25 * elementSize,
                - h - 1,
                0.25 * elementSize
            );
            verts[4].set(
                -0.75 * elementSize,
                - h - 1,
                0.25 * elementSize
            );
            verts[5].set(
                0.25 * elementSize,
                - h - 1,
                -0.75 * elementSize
            );

            // Top triangle  符合后面convex的要求，要CCW
            faces[0][0] = 0;
            faces[0][1] = 2;
            faces[0][2] = 1;

            // bottom triangle
            faces[1][0] = 3;
            faces[1][1] = 4;
            faces[1][2] = 5;

            // +x facing quad
            faces[2][0] = 0;
            faces[2][1] = 3;
            faces[2][2] = 5;
            faces[2][3] = 2;

            // +z facing quad
            faces[3][0] = 0;
            faces[3][1] = 1;
            faces[3][2] = 4;
            faces[3][3] = 3;

            // -xz facing quad
            faces[4][0] = 1;
            faces[4][1] = 2;
            faces[4][2] = 5;
            faces[4][3] = 4;
        }

        result.computeNormals();    //TODO 只有一个面需要计算法线，其他都是已知的
        result.computeEdges();
        result.updateBndSphR();

		// 加到缓存
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

    updateBndSphR() {
        // Use the bounding box of the min/max values
        const data = this.data;

        const s = this.elementSize;
        this.boundSphR = new Vec3(data[0].length * s, data.length * s, Math.max(Math.abs(this.maxValue), Math.abs(this.minValue))).length();
	}

	/**
	 * 最简假设的情况。地形很大，球一定小于格子 
	 * 在大于blockAng的情况下只能下滑
	 * 返回 0 没有碰撞 1 碰撞了 2 碰撞了，但是不允许控制，处于下滑状态
	 * 太陡的地方的处理：不能直接推出去，比如从一个缓坡走到悬崖
	 * 按理说悬崖的处理应该是逻辑做的，需要判断整体的高度
	 * @param pos 
	 * @param R 
	 * @param cliffAng 
	 * @param stopOnCliff
	 * @param stepHeight 
	 * @param hitPos 
	 * @param hitDeep 碰撞结果，需要回退的值
	 */
	hitSmallSphere(pos:Vec3, R:number, cliffAng:number, stopOnCliff:boolean, stepHeight:number, hitPos:Vec3, hitDeep:Vec3):int{
        const w = this.elementSize;
		const data = this.data;
		if(pos.x<0) return 0;
		if(pos.x>w*data[0].length) return 0;
		if(pos.z<0) return 0;
		if(pos.z>w*data.length) return 0;

		let maxdot = Math.cos(Math.PI/2-cliffAng);	// 与{0,1,0}矢量的夹角,越大越陡

        let xi = Math.floor(pos.x / w);
        let yi = Math.floor(pos.z / w);

		let idx = getHeightAt_idx;
		this.getIndexOfPosition(pos.x,pos.z,idx,true);
        const a = getNormalAt_a;
        const b = getNormalAt_b;
		const c = getNormalAt_c;
		let norm = sphereHitSimple_norm;
		let d = this.getPlane(xi,yi,true,a,b,c,norm);
		//球在这个平面的投影的区域
		let d0 = sphereHitSimple_d0;
		pos.vsub(a,d0);
		let dist = d0.dot(norm);	// pos到平面的距离
		pos.addScaledVector(-dist,norm,hitPos); // 投影到平面的点
		// 判断是否在三角形内

		this.getTriangle(xi,yi,true,a,b,c);
		this.getTriangle(xi,yi,false,a,b,c);

		// 
		if(hitNorm.y>maxdot){
			// 当前所在位置太陡了,只能下滑
			return 2;
		}

		return 0;
	}


	/**
	 * 
	 * @param data   0 1 2  ->x
	 *               3 4 5 
	 *               6 7 8
	 * 				 |
	 * 				 z
	 * @param vScale 
	 * @param gridsize 
	 * @param hitPos 
	 * @param hitNorm 
	 */
	sphereHit3x3Terrain(data:number[],vScale:number,gridsize:number,hitPos:Vec3, hitNorm:Vec3):boolean{

	}

	/**
	 * 与本地空间的一个球相撞，给角色控制器用的。因此只要一个等效的碰撞点和碰撞法线就行
	 * @param pos 
	 * @param R 
	 * @param blockAng  多大角度会阻挡前进，按照与地面的夹角算。单位是弧度
	 * @param stepHeight  开跨越多高的障碍
	 * @param hitPos 
	 * @param hitNorm 
	 */
	hitSphere1(pos:Vec3, R:number, blockAng:number, stepHeight:number, hitPos:Vec3, hitNorm:Vec3):boolean{
		if(pos.y-R>this.maxValue)
			return false;

		let minx=pos.x-R;
		let minz=pos.z-R;
		let maxx=pos.x+R;
		let maxz=pos.z+R;
		let data = this.data;

		if(maxx<0) return false;
		if(maxz<0) return false;
		let w = this.elementSize;
		if(minx>data[0].length*w) return false;
		if(minz>data.length*w) return false;

		// 先根据覆盖范围合并数据
		let idx = getHeightAt_idx;
		this.getIndexOfPosition(minx,minz,idx,true);
		let minpx = idx[0];
		let minpz = idx[1];
		this.getIndexOfPosition(maxx,maxz,idx,true);
		let maxpx = idx[0];
		let maxpz = idx[1];

		let gw = maxx-minx;
		let gh = maxz-minz;

		let maxdot = Math.cos(Math.PI/2-blockAng);	// 与{0,1,0}矢量的夹角,越大越陡
		// if(normal.y>maxdot) face=|


		for( let z=minpz; z<=maxpz; z++){
			for(let x=minpx; x<=maxpx; x++){
				let h0=data[z][x];
				let h1=data[z][x+1];
				let h2=data[z+1][x];
				let h3=data[z+1][x+1];
			}
		}
		return true;
	}

    /**
     * Sets the height values from an image. Currently only supported in browser.
	 * @param 
	 * @param scale 地形的大小,z是高度。以后改成y是高度 TODO yz
     */
    setHeightsFromImage(image:HTMLImageElement, scale:Vec3) {
        const canvas = document.createElement('canvas');
        let w = canvas.width = image.width;
        let h = canvas.height = image.height;
        const context = canvas.getContext('2d');
        if(!context){
            console.error('get context 2d error');
            return;
        }
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, w, h);

        const matrix = this.data;
        matrix.length = 0;
        this.elementSize = Math.abs(scale.x) / w;
        let hscale = scale.y/255;
        for (let i = 0; i < h; i++) {
            const row = [];
            for (let j = 0; j < w; j++) {
                const a = imageData.data[(i * w + j) * 4];
                //const b = imageData.data[(i * h + j) * 4 + 1];
                //const c = imageData.data[(i * h + j) * 4 + 2];
                const height = a  *hscale;
                if (scale.x < 0) {
                    row.unshift(height);
                } else {
                    row.push(height);
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
        
        return imageData;
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

var getPlane_a = new Vec3();
var getPlane_b = new Vec3();
var getPlane_c = new Vec3();
var getPlane_e0 = new Vec3();
var getPlane_e1 = new Vec3();

var sphereHitSimple_norm = new Vec3();
var sphereHitSimple_d0 = new Vec3();
/**
 * from https://en.wikipedia.org/wiki/Barycentric_coordinate_system
 * 计算二维三角形的重心坐标
 */
function barycentricWeights(x:f32, y:f32, ax:f32, ay:f32, bx:f32, by:f32, cx:f32, cy:f32, result:Vec3) {
    result.x = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
    result.y = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
    result.z = 1 - result.x - result.y;
}