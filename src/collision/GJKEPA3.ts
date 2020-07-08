import { Vec3 } from './../math/Vec3';
import { MinkowskiShape } from '../shapes/MinkowskiShape';
import { Transform } from '../math/Transform';
import { Quaternion } from '../math/Quaternion';
/**
 * Class to help in the collision in 2D and 3D.
 * To works the algorithm needs two convexe point cloud
 * like bounding box or smthg like this.
 * The function functions intersect and isIntersecting
 * helps to have informations about the collision between two object.
 *
 * @class wnp.helpers.CollisionGjkEpa
 * @constructor
 */
var tmpV1 = new Vec3();
var tmpV2 = new Vec3();
var tmpV3 = new Vec3();

var center1 = new Vec3();
var center2 = new Vec3();
var dir1 = new Vec3();
var vert1 = new Vec3();

var _containsTriangle_ab=new Vec3();
var _containsTriangle_ac = new Vec3();
var _containsTriangle_ao = new Vec3();
var _containsTriangle_abp=new Vec3();
var _containsTriangle_acp=new Vec3();

var edge1 = new Vec3();

var _check_worldA = new Vec3();
var _check_worldB = new Vec3();
var _check_sup=new Vec3();

var _check_invQA = new Quaternion();
var _check_NegDir = new Vec3();
var _check_invQB = new Quaternion();

var _computeSupport_Vec1 = new Vec3();
var _computeSupport_Vec2 = new Vec3();
var _computeSupport_Vec3 = new Vec3();
var _computeSupport_Vec4 = new Vec3();

var _findResponseWithTriangle_v1=new Vec3();

var _containsTriangle_abc = new Vec3();

class minkVec3 extends Vec3{
	worldA:Vec3 = new Vec3();
	worldB:Vec3 = new Vec3();

	copy(v:minkVec3){
		this.x=v.x;
		this.y=v.y;
		this.z=v.z;
		this.worldA.copy(v.worldA);
		this.worldB.copy(v.worldB);
		return this;
	}
}


function calcBarycentricCoord(p:Vec3, a:Vec3, b:Vec3, c:Vec3, result:Vec3){
	let ab = new Vec3();
	let ac = new Vec3();
	let ap = new Vec3();
	let bc = new Vec3();

	//let closest = result.closestPointOnSimplex;
	// Check if P in vertex region outside A
	b.vsub(a,ab);
	c.vsub(a,ac);
	p.vsub(a,ap);
	let d1 = ab.dot(ap);
	let d2 = ac.dot(ap);
	if (d1 <= 0.0 && d2 <= 0.0){
		result.set(1,0,0);
		return ; 
	}

	// Check if P in vertex region outside B
	let bp =new Vec3();
	p.vsub(b,bp);
	let d3 = ab.dot(bp);
	let d4 = ac.dot(bp);
	if (d3 >= 0.0 && d4 <= d3){
		result.set(0,1,0);
		return ;  // b; // barycentric coordinates (0,1,0)
	}

	// Check if P in vertex region outside C
	let cp = new Vec3();
	p.vsub(c,cp);
	let d5 = ab.dot(cp);
	let d6 = ac.dot(cp);
	if (d6 >= 0.0 && d5 <= d6){
		result.set(0,0,1);
		return ;  //c; // barycentric coordinates (0,0,1)
	}

	// Check if P in edge region of AB, if so return projection of P onto AB
	let vc = d1 * d4 - d3 * d2;
	if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0){
		let v = d1 / (d1 - d3);
		result.set(1 - v, v, 0);
		return ;
	}


	// Check if P in edge region of AC, if so return projection of P onto AC
	let vb = d5 * d2 - d1 * d6;
	if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0){
		let w = d2 / (d2 - d6);
		result.set(1 - w, 0, w);
		return ;
	}

	// Check if P in edge region of BC, if so return projection of P onto BC
	let va = d3 * d6 - d5 * d4;
	if (va <= 0.0 && (d4 - d3) >= 0.0 && (d5 - d6) >= 0.0){
		let w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
		c.vsub(b,bc);
		result.set(0, 1 - w, w);
		return ;
	}

	// P inside face region. Compute Q through its barycentric coordinates (u,v,w)
	let denom = 1.0 / (va + vb + vc);
	let v = vb * denom;
	let w = vc * denom;
	result.set(1 - v - w, v, w);
}

function calcPtInTriangle(barycentricCoord:Vec3, a:Vec3, b:Vec3, c:Vec3, out:Vec3){
	// out = a*bc.x+b*bc.y+c*bc.z
	let cx = barycentricCoord.x;
	let cy = barycentricCoord.y;
	let cz = barycentricCoord.z;
	out.set(
		cx*a.x+cy*b.x+cz*c.x,
		cx*a.y+cy*b.y+cz*c.y,
		cx*a.z+cy*b.z+cz*c.z
	);
}

class Simplex{
	points=[new minkVec3(), new minkVec3(), new minkVec3(), new minkVec3()];

	vertnum=0;
	/**
	 * 
	 * @param v  	 这几个值必须复制，不能引用
	 * @param worldA 
	 * @param worldB 
	 */
    addvertex( v:minkVec3){
        let n = this.vertnum++;
		this.points[n].copy(v);
    }
    
    splice(removeid:int){
		let pts = this.points;
        switch(removeid){
            case 0:
				pts[0].copy(pts[1]);
            case 1:
				pts[1].copy(pts[2]);
            case 2:
				pts[2].copy(pts[3]);
        }
        this.vertnum--;
    }

    /**
     * 保留两个点
     * @param id0 
     * @param id1 
     */
    tetrahedron2line(id0:int,id1:int){
        let pts = this.points;
        let p1x=pts[id0].x;
        let p1y=pts[id0].y;
        let p1z=pts[id0].z;
        let p2x=pts[id1].x;
        let p2y=pts[id1].y;
        let p2z=pts[id1].z;
        pts[0].set(p1x,p1y,p1z);
		pts[1].set(p2x,p2y,p2z);
		
		let A1x = pts[id0].worldA.x;
		let A1y = pts[id0].worldA.y;
		let A1z = pts[id0].worldA.z;
		let A2x = pts[id1].worldA.x;
		let A2y = pts[id1].worldA.y;
		let A2z = pts[id1].worldA.z;
		pts[0].worldA.set(A1x,A1y,A1z);
		pts[1].worldA.set(A2x,A2y,A2z);

		let B1x = pts[id0].worldB.x;
		let B1y = pts[id0].worldB.y;
		let B1z = pts[id0].worldB.z;
		let B2x = pts[id1].worldB.x;
		let B2y = pts[id1].worldB.y;
		let B2z = pts[id1].worldB.z;
		pts[0].worldB.set(B1x,B1y,B1z);
		pts[1].worldB.set(B2x,B2y,B2z);

        this.vertnum=2;
    }

    remove(id:int){

    }
}

class EPA_NearestInfo{
    index=-1;
    distance=1e6;
}

var nearest_result = new EPA_NearestInfo();

class Triangle {
    a:minkVec3;	// 三角形，edge的点都是引用，为了能直接对象比较。以后可以改成polytope负责分配顶点
    b:minkVec3;
    c:minkVec3;
    n = new Vec3();
    constructor(a: minkVec3, b: minkVec3, c: minkVec3) {
        this.a=a;
        this.b=b;
        this.c=c;
        b.vsub(a, tmpV1);
        c.vsub(a, tmpV2);
        tmpV1.cross(tmpV2, this.n);
        this.n.normalize();
    }
}

class Polytope_Edge{
    a:minkVec3;
    b:minkVec3;
    //addid=0;    // 第几次加入的，同一次加入的忽略
}


class EdgePool{
    edges:Polytope_Edge[]=[];
    length=0;
    addedge(a:minkVec3, b:minkVec3){
        // 首先要判断是否重复了
        let edges = this.edges;
        let len = this.length;
        for(let i=0; i<len; i++){
			let edge = edges[i];
			// a-b, b-a 是一个。这种情况表示这是一个共享边，需要删掉，因为只需要边缘边
            if((edge.a==a && edge.b==b)||(edge.a==b && edge.b==a)){
				// 删掉这个边
				edges[i].a = edges[len-1].a;
				edges[i].b = edges[len-1].b;
				this.length--;
                return;
            }
        }
        // 没有重复就添加
        if(edges.length>len){
            let e = edges[this.length++];
            e.a=a;
            e.b=b;
        }else{
            let e = new Polytope_Edge();
            e.a=a;
            e.b=b;
            edges.push(e);
            this.length++;
        }
    }
    reset(){
        this.length=0;
    }
    destroy(){
        this.edges.length=0;
        this.length=0;
    }
}

var edgepool = new EdgePool();

class Polytope{
	vertes:Vec3[]=[];
	clear(){
		this.vertes.length=0;
	}
	addVert(v:Vec3){
		this.vertes.push( new Vec3(v.x,v.y,v.z));
	}

	init(v1:Vec3, v2:Vec3, v3:Vec3, v4:Vec3){
		this.addVert(v1);
		this.addVert(v2);
		this.addVert(v3);
		this.addVert(v4);
	}

	getTriangle(id:int){

	}
	getEdge(id:int){
		
	}
}

export class CollisionGjkEpa {
    EPSILON = 0.000001;
    shapeA:MinkowskiShape|null=null;
    shapeB:MinkowskiShape|null=null;

    /**
     * Method to get a normal of 3 points in 2D and 3D.
    *  得到一个法线 axbxc 。结果与c垂直，在ab平面上, 例如 v1xv2xv1 得到的法线是一个与v1垂直，在v1v2平面上的法线。
     *  axbxc
     * @param  a
     * @param  b    a的起点指向原点的方向
     * @param  c
     * @return  The normal.
     */
    private _getNormal(a: Vec3, b: Vec3, c: Vec3, norm: Vec3) {
        var ac = a.dot(c);// Dot(a, c); // perform aDot(c)
        var bc = b.dot(c);//Dot(b, c); // perform bDot(c)

        // perform b * a.Dot(c) - a * b.Dot(c)
        b.scale(ac, tmpV1);
        a.scale(bc, tmpV2);
        tmpV1.vsub(tmpV2, norm);
        norm.normalize();
        return norm;
        // return  b.scale(ac).subtract(a.scale(bc)).normalize();
    }

    /**
     * Gets the barycenter of a cloud points.
     *
     * @method _getBarycenter
     * @private
     * @param  vertices the cloud points
     * @return  The barycenter.
     */
    _getBarycenter(vertices: Vec3[], avg: Vec3) {
        avg.set(0, 0, 0);
        for (var i = 0; i < vertices.length; i++) {
            avg.vadd(vertices[i], avg);
        }

        avg.scale(1 / vertices.length, avg);
        return avg;
    }

    /**
     * Gets the farthest point of a cloud points.
     *
     * @method _getFarthestPointInDirection
     * @private
     * @param  vertices the cloud points.
     * @param  d The direction to search.
     * @return  The barycenter.
     */
    _getFarthestPointInDirection(vertices: Vec3[], d: Vec3) {
        var maxProduct = vertices[0].dot(d);
        var index = 0;
        for (var i = 1; i < vertices.length; i++) {
            var product = vertices[i].dot(d);
            if (product > maxProduct) {
                maxProduct = product;
                index = i;
            }
        }
        return vertices[index];
    }

    /**
     * Gets the nearest edge of the simplex.
     *
     * @method _getNearestEdge
     * @private
     * @param  simplex The simplex.
     * @return {Object} Informations about the nearest edge (distance, index and normal).
     */
    _getNearestEdge(simplex: Simplex) {
		/*
        var distance = Infinity,
            index, normal;

        for (var i = 0; i < simplex.vertnum; i++) {
            var j = (i + 1) % simplex.vertnum;
            var v1 = simplex.points[i];
            var v2 = simplex.points[j];

            var edge = v2.subtract(v1);
            if (edge.lengthSquared() === 0) {
                continue;
            }

            var originTov1 = v1;

            var n = this._getNormal(edge, originTov1, edge);

            if (n.lengthSquared() === 0) {
                n.y = -edge.x;
                n.x = edge.y;
            }

            //n = n.scale(1 / n.length()); //normalize
            var dist = Math.abs(n.dot(v1)); //distance from origin to edge

            if (dist < distance) {
                distance = dist;
                index = j;
                normal = n;
            }
        }

        return {
            distance: distance,
            index: index,
            normal: normal
        };
		*/
    }

    /**
     * Gets the nearest Triangle of the polytope.
     * 计算原点到polytope的哪个三角形最近。
     * 
     * @method _getNearestTriangle
     * @private
     * @param  polytope The polytope.
     * @return {Object} Informations about the nearest edge (distance and index).
     */
    _getNearestTriangle(polytope: Triangle[], result:EPA_NearestInfo) {
        var distance = Infinity,
            index=-1;

        for (var i = 0; i < polytope.length; i++) {
            var triangle = polytope[i];
            var dist = Math.abs(triangle.n.dot(triangle.a));

            if (dist < distance) {
                distance = dist;
                index = i;
            }

        }
        result.distance=distance;
        result.index=index;
    }

    /**
     * Checks if the origin is in a line.
     * 检查原点是否在线段上，并且计算新的dir
     * @method _containsLine
     * @param  simplex The simplex.
     * @param  dir The direction.
     * @return False in any case because the algorithm just begin.
     */
    private _containsLine(simplex: Simplex, dir: Vec3): boolean {
        var a = simplex.points[1];
        var b = simplex.points[0];
        var ab = edge1
        b.vsub(a,ab);
        var ao = a.scale(-1);
        if (ab.lengthSquared() !== 0) {
            this._getNormal(ab, ao, ab, dir);
        } else {
            dir.copy(ao);
        }
        // 线段永远返回false，必须要组成四面体才能结束
        return false;
    }

    /**
     * Checks if the origin is in a triangle.
     *
     * @method _containsTriangle
     * @private
     * @param  simplex The simplex.
     * @param  dir The direction.
     * @return If in 2D case, may return true if the origin is in the triangle.
     */
    private _containsTriangle(simplex: Simplex, dir: Vec3): boolean {
        let pts = simplex.points;
        var a = pts[2];
        var b = pts[1];
        var c = pts[0];
        var ab = _containsTriangle_ab;
        b.vsub(a,ab);
        var ac = _containsTriangle_ac;
        c.vsub(a,ac);
        var ao = _containsTriangle_ao;
        a.negate(ao);

        var abp = _containsTriangle_abp;
        this._getNormal(ac, ab, ab,abp);
        var acp = _containsTriangle_acp;
        this._getNormal(ab, ac, ac,acp);

        if (abp.dot(ao) > 0) {
            // 退化
            simplex.splice(0);// remove C
            dir.copy(abp);
        } else if (acp.dot(ao) > 0) {
            // 退化
            simplex.splice(1);// remove B
            dir.copy(acp);
        } else {
            // 确定在哪个方向
            //if (dir.z === undefined) {
            //    return true;
            //} else {
                var abc = _containsTriangle_abc;
                ab.cross(ac,abc);
                dir.copy(abc);
                if (abc.dot(ao) <= 0) {
                    //upside down tetrahedron
                    pts[0] = b;
                    pts[1] = c;
                    pts[2] = a;
                    dir.set(-abc.x, -abc.y, -abc.z);
                }

            //    return false;
            //}
        }

        // 三角形永远返回false，必须要组成四面体才能结束
        return false;
    }

    static _containsTetrahedron_ab = new Vec3();
    static _containsTetrahedron_ac = new Vec3();
    static _containsTetrahedron_ad = new Vec3();
    static _containsTetrahedron_ao = new Vec3();
    static _containsTetrahedron_abc = new Vec3();
    static _containsTetrahedron_acd = new Vec3();
    static _containsTetrahedron_adb = new Vec3();

    /**
     * Checks if the origin is in a tetrahedron.
     * 
     *                  3   a 最后加的点
     *                / | \
     *               /  |  \
     *              /   |   \
     *            /     2 b  \
     *         d 0 ---------- 1 c
     *                 
     * @method _containsTetrahedron
     * @private
     * @param  simplex The simplex.
     * @param  dir The direction.
     * @return {Boolean} Return true if the origin is in the tetrahedron.
     */
    _containsTetrahedron(simplex: Simplex, dir: Vec3) {
        let pts = simplex.points;
        var a = pts[3];
        var b = pts[2];
        var c = pts[1];
        var d = pts[0];
        var ab = b.vsub(a,CollisionGjkEpa._containsTetrahedron_ab);
        var ac = c.vsub(a,CollisionGjkEpa._containsTetrahedron_ac);
        var ad = d.vsub(a,CollisionGjkEpa._containsTetrahedron_ad);
        var ao = CollisionGjkEpa._containsTetrahedron_ao;
        a.negate(ao);

        // 检查四面体的除了底面的其他面的法线（反）是否指向原点。底面一定是指向的，因为a点就是根据底面的朝向获得的。
        var abc = ab.cross(ac,CollisionGjkEpa._containsTetrahedron_abc);
        var acd = ac.cross(ad,CollisionGjkEpa._containsTetrahedron_acd);
        var adb = ad.cross(ab,CollisionGjkEpa._containsTetrahedron_adb);

        var abcTest = 0x1,
            acdTest = 0x2,
            adbTest = 0x4;

        var planeTests = 
            (abc.dot(ao) > 0 ? abcTest : 0) |
            (acd.dot(ao) > 0 ? acdTest : 0) |
            (adb.dot(ao) > 0 ? adbTest : 0);

        switch (planeTests) {
            case abcTest:
                // 如果只有abc朝向原点。则以abc为底重新采样
                return this._checkTetrahedron(ao, ab, ac, abc, dir, simplex);
            case acdTest:
                // 如果只有acd朝向原点
                // 由于_checkTetrahedron会使用固定顶点id，所以这里要调整一下顺序，保证1,2分别对应当前检查侧面的左边和右边(看向朝里的法线)
                // 注意顺序，防止拷贝被拷贝修改的值
                pts[2].copy(c);
                pts[1].copy(d);
                return this._checkTetrahedron(ao, ac, ad, acd, dir, simplex);
            case adbTest:
                //in front of triangle ADB
                // 如果只有adb朝向原点
                pts[1].copy(b);
                pts[2].copy(d);
                return this._checkTetrahedron(ao, ad, ab, adb, dir, simplex);

            case abcTest | acdTest:
                // 如果原点在两个面的正方向。
				// 如果在abc和acd的正方向
				// 需要去掉 abc和acd
                return this._checkTwoTetrahedron(ao, ab, ac, abc, dir, simplex);
            case acdTest | adbTest:
                pts[2].copy(c);
                pts[1].copy(d);
                pts[0].copy(b);
                return this._checkTwoTetrahedron(ao, ac, ad, acd, dir, simplex);
            case adbTest | abcTest:
                pts[1].copy(b);
                pts[2].copy(d);
                pts[0].copy(c);
                return this._checkTwoTetrahedron(ao, ad, ab, adb, dir, simplex);
            default:
                break;
        }

        // 否则，四个面都指向原点，则包含原点
        return true;
    }

    private static _checkTwoTetrahedron_abc_ac = new Vec3();
    private static _checkTwoTetrahedron_ab=new Vec3();
    private static _checkTwoTetrahedron_ac=new Vec3();
    private static _checkTwoTetrahedron_abc=new Vec3();
    /**
     *  ab,ac是第一个底面的两条边
     * 
     * @param ao 
     * @param ab  看向朝里的法线的时候的右边
     * @param ac  看向朝里的法线的时候的左边
     * @param abc 这个面的法线
     * @param dir  返回方向
     * @param simplex 
     */
    private _checkTwoTetrahedron(ao: Vec3, ab: Vec3, ac: Vec3, abc: Vec3, dir: Vec3, simplex: Simplex) {

		/**
		 * 在abc和acd的正方向。
		 */

		var abc_ac = CollisionGjkEpa._checkTwoTetrahedron_abc_ac;
		// 在abc平面上的，与ac垂直的线
        abc.cross(ac, abc_ac);

        let pts = simplex.points;
        if (abc_ac.dot(ao) > 0) {
            //the origin is beyond AC from ABC's
            //perspective, effectively excluding
			//ACD from consideration
			// 从abc平面上看的话，原点在ac的外面

            //we thus need test only ACD
            pts[2].copy(pts[1]);    // ACD的右边
            pts[1].copy(pts[0]);    // ACD的左边

            /*
            ab = pts[2].subtract(pts[3]);
            ac = pts[1].subtract(pts[3]);
            abc = ab.constructor.Cross(ab, ac);
            */
           ab = pts[2].vsub(pts[3], CollisionGjkEpa._checkTwoTetrahedron_ab);// 这时候的ab=原来的ac
           ac = pts[1].vsub(pts[3], CollisionGjkEpa._checkTwoTetrahedron_ac);// 这时候的ac=原来的ad
           abc = ab.cross(ac, CollisionGjkEpa._checkTwoTetrahedron_abc);    // 计算abc的法线，即原来的acd的法线。

            return this._checkTetrahedron(ao, ab, ac, abc, dir, simplex);
        }

        var ab_abc = CollisionGjkEpa._checkTwoTetrahedron_abc_ac;   // 另外一条边。重用变量
        ab.cross(abc,ab_abc);

        if (ab_abc.dot(ao) > 0) {
            simplex.tetrahedron2line(2,3);
            //dir is not ab_abc because it's not point towards the origin;
            //ABxA0xAB direction we are looking for
            this._getNormal(ab, ao, ab, dir);
            return false;
        }
        return false;
    }

    static _checkTetrahedron_acp = new Vec3();
    /**
     * 
     * @param ao    朝向原点的方向
     * @param ab 
     * @param ac 
     * @param abc   ao底面的法线（朝向指向原点方向）
     * @param dir   输出新的采样方向
     * @param simplex 
     */
    private _checkTetrahedron(ao: Vec3, ab: Vec3, ac: Vec3, abc: Vec3, dir: Vec3, simplex: Simplex ) {
        var acp = abc.cross(ac, CollisionGjkEpa._checkTetrahedron_acp);

        // 底面法线x左侧面 的方向是否朝向原点
        if (acp.dot(ao) > 0) {
            simplex.tetrahedron2line(1,3);
            //dir is not abc_ac because it's not point towards the origin;
            //ACxA0xAC direction we are looking for
            this._getNormal(ac, ao, ac, dir);
            return false;
        }

        //almost the same like triangle checks
        // 右侧面x底面法线 的方向是否朝向原点
        var ab_abc = ab.cross(abc, CollisionGjkEpa._checkTetrahedron_acp); // 重用上面的变量了
        if (ab_abc.dot(ao) > 0) {
            simplex.tetrahedron2line(2,3);
            //dir is not ab_abc because it's not point towards the origin;
            //ABxA0xAB direction we are looking for
            this._getNormal(ab, ao, ab, dir);
            return false;
        }

        // 如果左右两边都不朝向原点，只能用abc重新采样
        // 把第一个点去掉，退化成三角形。以abc所在三角形为（确定朝向原点）底面，用abc作为采样点，再来
        simplex.splice(0);
        dir.copy(abc);
        return false;
    }

    /**
     * The support function.
     *
     * @method support
     * @param  shapei The convexe collider object.
     * @param  shapej The convexe collided object.
     * @param  direction The direction.
     * @return  The support points.
     */
    support(shapei: Vec3[], shapej: Vec3[], direction: Vec3, point:Vec3) {
        // d is a vector direction (doesn't have to be normalized)
        // get points on the edge of the shapes in opposite directions
        direction.normalize();
        var p1 = this._getFarthestPointInDirection(shapei, direction);
        var p2 = this._getFarthestPointInDirection(shapej, direction.scale(-1));
        // perform the Minkowski Difference
        p1.vsub(p2,point);
        // p3 is now a point in Minkowski space on the edge of the Minkowski Difference
        return point;
    }

    /**
     * Checks if the simplex contains the origin.
     * 原点是否在单形内
     *
     * @method findResponseWithEdge
     * @param  simplexThe simplex or false if no intersection.
     * @param  dir The direction to test.
     * @return Contains or not.
     */
    containsOrigin(simplex: Simplex, dir: Vec3) {
        if (simplex.vertnum === 2) {
            return this._containsLine(simplex, dir);
        }
        if (simplex.vertnum === 3) {
            return this._containsTriangle(simplex, dir);
        }
        if (simplex.vertnum === 4) {
            return this._containsTetrahedron(simplex, dir);
        }
        return false;
    }

    /**
     * 注意 这里假设dir是没有规格化的
     * @param transA 
     * @param transB 
     * @param dir   
     * @param worldA 
     * @param worldB 
     * @param minkowPt 
     */
    computeSupport(transA: Transform, transB: Transform, dir: Vec3, worldA: Vec3, worldB: Vec3, minkowPt: Vec3) {
        let A = this.shapeA;
        let B = this.shapeB;
        let qa = transA.quaternion;
        let qb = transB.quaternion;
        let invqa = _check_invQA;
        let invqb = _check_invQB;
        qa.conjugate(invqa);
        qb.conjugate(invqb);

		//先把dir转换到本地空间
		let dirA = _computeSupport_Vec1;
        let dirB = _computeSupport_Vec2;

        // 规格化，后面的计算support点的地方需要规格化之后的
        dirA.copy(dir);
        dirA.normalize();

        let negDir = _check_NegDir;
        negDir.copy(dirA).negate(negDir);

        invqa.vmult(dirA,dirA);
        invqb.vmult(negDir,dirB);

		let supA = _computeSupport_Vec3;
        let supB = _computeSupport_Vec4;
        A&&A.getSupportVertex(dirA,supA);
        B&&B.getSupportVertex(dirB,supB);

        // 转到世界空间
        transA.pointToWorld(supA,worldA);
        transB.pointToWorld(supB,worldB);
        worldA.vsub(worldB,minkowPt);
    }

    /**
     * The GJK (Gilbert–Johnson–Keerthi) algorithm.
     * Computes support points to build the Minkowsky difference and
     * create a simplex. The points of the collider and the collided object
     * must be convexe.
     *
     * @return  The simplex or false if no intersection.
     */    
    check(transi: Transform, transj: Transform) {
        var it = 0;
        var simplex = new Simplex(); //TODO

        // 根据位置计算初始采样方向
        var origi = transi.position;
        var origj = transj.position;

        // initial direction from the center of 1st body to the center of 2nd body
        var dir = dir1;
        origi.vsub(origj,dir);

        // if initial direction is zero – set it to any arbitrary axis (we choose X)
        if (dir.lengthSquared() < this.EPSILON) {
            dir.x = 1;
        }

        // set the first support as initial point of the new simplex
        let minkowpt = new minkVec3();	//TODO 
        this.computeSupport(transi, transj,dir, minkowpt.worldA,minkowpt.worldB,minkowpt);
        simplex.addvertex(minkowpt);

        if (minkowpt.dot(dir) <= 0) {
            // 没有发生碰撞
            // TODO 这个没有考虑margin优化
            return false;
        }

        dir.negate(dir);// we will be searching in the opposite direction next

        var max = 1000;//collidedPoints.length * colliderPoints.length;    // TODO
        while (it < max) {
            let simplen = simplex.vertnum;
            if (dir.lengthSquared() === 0 && simplen >= 2) {
                // 如果dir的长度为0，且simplex有值，就取最后一个simplex的垂直向量
                // Get perpendicular direction to last simplex
                simplex.points[simplen - 1].vsub(simplex.points[simplen - 2],dir);
                // TODO 这里只取了2d的垂线
                var tmp = dir.y;
                dir.y = -dir.x;
                dir.x = tmp;
            }

            // TODO 没有记录对应i,j的全局点
            this.computeSupport(transi,transj,dir,minkowpt.worldA, minkowpt.worldB,minkowpt);

            // make sure that the last point we added actually passed the origin
            if (minkowpt.dot(dir) <= 0) {
                // if the point added last was not past the origin in the direction of d
                // then the Minkowski Sum cannot possibly contain the origin since
                // the last point added is on the edge of the Minkowski Difference
                // 没有发生碰撞              
                return false;
            }

            simplex.addvertex(minkowpt);
            // otherwise we need to determine if the origin is in
            // the current simplex
            // 如果单形包含原点了，则发生碰撞了。
            if (this.containsOrigin(simplex, dir)) {
                return simplex;
            }
            it++;
        }
        return false;
    }

    /**
     * Finds the response with the simplex (edges) of the gjk algorithm.
     *
     * @method findResponseWithEdge
     * @param  colliderPoints The convexe collider object.
     * @param  collidedPoints The convexe collided object.
     * @param  simplex The simplex.
     * @return  The penetration vector.
     */
    findResponseWithEdge(colliderPoints: Vec3[], collidedPoints: Vec3[], simplex: Simplex) {
		/*
        var edge = this._getNearestEdge(simplex);
        var sup = this.support(colliderPoints, collidedPoints, edge.normal); //get support point in direction of edge's normal
        var d = Math.abs(sup.constructor.Dot(sup, edge.normal));

        if (d - edge.distance <= this.EPSILON) {
            return edge.normal.scale(edge.distance);
        } else {
            simplex.points.splice(edge.index, 0, sup);
        }
		return false;
		*/
    }

    /**
     * Finds the response with the polytope done with the simplex of the gjk algorithm.
     * 
     * 遍历指定的polytope，找出距离原点最近的面，如果找到了，返回深度向量
	 * 如果不是边界面的话，把polytope扩展一个四面体。返回null
     * @method findResponseWithTriangle
     * @param  colliderPoints The convexe collider object.
     * @param  collidedPoints The convexe collided object.
     * @param  polytope The polytope done with the simplex.    初始polytope,是一个由四个三角形组成的四面体
     * @return  找到了最近边界了，则深度向量，否则扩展多面体并返回null
     */
    findResponseWithTriangle(transA: Transform, transB: Transform,polytope: Triangle[],hitA:Vec3, hitB:Vec3, hitNorm:Vec3):f32 {
        if (polytope.length === 0) {
            return -1;
        }

        var nearest = nearest_result;
        this._getNearestTriangle(polytope,nearest);
        var triangle = polytope[nearest.index];

        // 根据最近面的法线取一个新的顶点，用来扩展多面体
		let sup = new minkVec3(); // 这个不能复用，因为下面要用到triangle中作为引用
        this.computeSupport(transA, transB, triangle.n, sup.worldA, sup.worldB, sup);

        var d = Math.abs(sup.dot(triangle.n));

        if ((d - nearest.distance <= this.EPSILON)) {
			// 新的采样点还在这个最近面上，表示已经到了外边界了，完成。
			// normal 取反，B指向A。是否取反实在想不通的话就实际测试，反正只有两种情况。
			triangle.n.negate(hitNorm);
			//hitNorm.copy( triangle.n);
			// 计算Minkowsky上的最近点
			let nearestpt = new Vec3(); //TODO
			triangle.n.scale(-nearest.distance,nearestpt);
			let bc=new Vec3();
			calcBarycentricCoord(nearestpt,triangle.a, triangle.b,triangle.c, bc);
			// 计算碰撞点
			calcPtInTriangle(bc,triangle.a.worldA,triangle.b.worldA,triangle.c.worldA,hitA);
			calcPtInTriangle(bc,triangle.a.worldB,triangle.b.worldB,triangle.c.worldB,hitB);
			return nearest.distance;
            //return triangle.n.scale(nearest.distance);
        } else {
			// 下面开始扩展
			
			// 本次扩展参与的边，即被新点照射到的三角形的所有的边
            var edges = edgepool;
            edges.reset();

            for (var i = polytope.length - 1; i >= 0; i--) {
                triangle = polytope[i];
                // can this face be 'seen' by entry_cur_support?
                let norm = triangle.n;
                let p1 = triangle.a;
                // norm dot (sup-p1) 如果这个sup在norm方向，则需要扩展这个面
                if (norm.dot(sup.vsub(p1,_findResponseWithTriangle_v1)) > 0) {
					// 统计需要扩展的边。注意要去掉重复。
					// 这时候，有的边是内部边，实际是不需要的？
                    edges.addedge(triangle.a,triangle.b);
                    edges.addedge(triangle.b,triangle.c);
                    edges.addedge(triangle.c,triangle.a);
                    // 既然要扩展边了，那就要删掉当前这个三角形了。由于上面是i--,所以这个不会影响遍历数组
                    polytope.splice(i, 1);
                }
            }

            // create new triangles from the edges in the edge list
            for (var i = 0; i < edges.length; i++) {
                let edge = edges.edges[i];
                triangle = new Triangle(sup, edge.a, edge.b);   //TODO 效率
                if (triangle.n.length() !== 0) {
                    polytope.push(triangle);
                }
            }
        }
        return -1;
    }

    /**
     * Gets the response of the penetration vector with the simplex.
     *
     *  EPA算法（expanding-polytope-algorithm）
     *  从gjk开始的四面体，不断扩展polytope
     * 
     * @param transA 
     * @param transB 
     * @param  simplex The simplex of the Minkowsky difference.
     * @return The penetration vector.
     */
    getResponse(transA: Transform, transB: Transform, simplex: Simplex,hitA:Vec3, hitB:Vec3, hitNorm:Vec3):f32 {
		var it = 0;
		let deep = -1;
        let pts = simplex.points;    
        var polytope: Triangle[] = [//TODO 优化
            // 注意顺序
            new Triangle(pts[0], pts[1], pts[2]),
            new Triangle(pts[0], pts[2], pts[3]),
            new Triangle(pts[0], pts[3], pts[1]),
            new Triangle(pts[1], pts[3], pts[2])
        ] ;

        var max = 1000;// TODO 最多扩展次数
        while (it < max) {
            if (pts[0].z === undefined) {
                // 2D的情况
                //response = this.findResponseWithEdge(colliderPoints, collidedPoints, simplex);
            } else {
                // 3D的情况
                deep = this.findResponseWithTriangle(transA, transB, polytope, hitA, hitB, hitNorm);
            }
            if (deep>0) {
				return deep;
            }
            it++;
        }
        return -1;
    }    


    /**
     * Checks if the collider and the collided object are intersecting
     * and give the response to be out of the object.
     *
     * 判断两个形状是否碰撞，并返回碰撞深度信息
	 * 
	 * @param transA 
	 * @param transB 
	 * @param hitA 
	 * @param hitB 
	 * @param hitNorm 
	 * @param justtest 
	 */
    intersect(transA: Transform, transB: Transform,hitA:Vec3,hitB:Vec3, hitNorm:Vec3, justtest:boolean):f32 {
//DEBUG
	let transa  = JSON.parse( `{"position":{"x":3.047712156903969,"y":7.238084823732435,"z":5.3513835448599},"quaternion":{"x":7.633624811061411e-8,"y":2.863294548138404e-7,"z":-7.981622297533533e-16,"w":0.9999999999999563}}`);
		transA.position.copy(transa.position);
		transA.quaternion.copy(transa.quaternion);
//DEBUG

        // 如果发生碰撞，返回一个simplex
        var simplex = this.check(transA, transB);

        if (simplex) {
            if(justtest)
                return 1;
			// 根据simplex和两个shape来得到碰撞信息
			let deep = this.getResponse(transA, transB, simplex,hitA,hitB, hitNorm);
			if(deep<0){
				return -1;
			}
			// response是从A指向B的
			//let deep = response.length();
			//var norm = response.clone();    //TODO 
			//TODO 深度减去一个误差值？
			//return response.vsub(norm,response);    //TODO 这个返回后禁止保存
			// 计算碰撞点
			return deep;			
        }

        return -1;
    }

}