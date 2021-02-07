import { Vec3 } from '../math/Vec3';
import { MinkowskiShape } from '../shapes/MinkowskiShape';
import { Transform } from '../math/Transform';
import { Quaternion } from '../math/Quaternion';
import { Sphere } from '../shapes/Sphere';

var tmpV1 = new Vec3();
var tmpV2 = new Vec3();

var dir1 = new Vec3();
var normedDir = new Vec3();

var _containsTriangle_ab=new Vec3();
var _containsTriangle_ac = new Vec3();
var _containsTriangle_bc = new Vec3();
var _containsTriangle_abp=new Vec3();
var _containsTriangle_acp=new Vec3();
var _containsTriangle_bcp=new Vec3();

var edge1 = new Vec3();

var _check_invQA = new Quaternion();
var _check_NegDir = new Vec3();
var _check_invQB = new Quaternion();

var _computeSupport_Vec1 = new Vec3();
var _computeSupport_Vec2 = new Vec3();
var _computeSupport_Vec3 = new Vec3();
var _computeSupport_Vec4 = new Vec3();

var _findResponseWithTriangle_v1=new Vec3();
var _containsTriangle_abc = new Vec3();

var findResponseWithTriangle_nearest=new Vec3();
var findResponseWithTriangle_bc = new Vec3();

/**
 * Minkowski点。主要是用来保存原始形状的上的采样点.worldA/B
 */
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


/**
 * 计算p在abc上的重心坐标。用来根据Minkowski形上的点来插值采样点
 * @param p 
 * @param a 
 * @param b 
 * @param c 
 * @param result 
 */
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

/**
 * 给一个重心坐标得到一个点
 * @param barycentricCoord 
 * @param a 
 * @param b 
 * @param c 
 * @param out 
 */
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
	/** 顶点个数。由于上面固定是4个，所以靠这个成员 */
	vertnum=0;
	reset(){
		this.vertnum=0;
	}
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
	
	/**
	 * 移除某个点
	 * @param removeid 
	 */
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

	hasPoint(pt:minkVec3){
		let pts = this.points;
		for(let i=0; i<this.vertnum; i++){
			let curpt = pts[i];
			let dx = curpt.x-pt.x;
			let dy = curpt.y-pt.y;
			let dz = curpt.z-pt.z;
			if(dx*dx+dy*dy+dz*dz<1e-6){
				return true;
			}
		}
		return false;
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
	
	/**
	 * 当形成四面体的时候，最后一个点其实与底面重合
	 */
	isPtInTri(pt:minkVec3,norm:Vec3){
		if(this.vertnum!=3)return false;
		let pts = this.points;
		let p0=pts[0];
		let dx = pt.x-p0.x;
		let dy = pt.y-p0.y;
		let dz = pt.z-p0.z;
		let d = dx*norm.x+dy*norm.y+dz*norm.z;
		return (Math.abs(d)<1e-6)
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
    constructor(a?: minkVec3, b?: minkVec3, c?: minkVec3) {
		if(a&&b&&c){
			this.init(a,b,c);
		}
	}

	init(a: minkVec3, b: minkVec3, c: minkVec3){
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

class HitResult{
	hitA:Vec3;			// 引用
	hitB:Vec3;			// 引用
	hitNorm:Vec3;		// 引用
	deep=0;
}

const enum GJKResult{
	NOCD=0,
	INMARGIN=1,
	NEEDEPA=2
}

export class CollisionGjkEpa {
	
    EPSILON = 0.000001;
    shapeA:MinkowskiShape|null=null;
	shapeB:MinkowskiShape|null=null;
	private simplex = new Simplex();
	private hitResult = new HitResult();
	/** epa初始多面体 */
	private _polytope: Triangle[] = [
		new Triangle(),
		new Triangle(),
		new Triangle(),
		new Triangle()
	] ;

	private useMargin=true;

    /**
     * Method to get a normal of 3 points in 2D and 3D.
    *  得到一个法线 axbxc 。结果与c垂直，在ab平面上, 例如 v1xv2xv1 得到的法线是一个与v1垂直，在v1v2平面上的法线。
     *  axbxc
     * @param  a
     * @param  b    a的起点指向原点的方向
     * @param  c
     * @return   normal 已经规格化了
     */
    private _getNormal(a: Vec3, b: Vec3, c: Vec3, norm: Vec3) {
        var ac = a.dot(c);
        var bc = b.dot(c);

        // b * a.Dot(c) - a * b.Dot(c)
        b.scale(ac, tmpV1);
        a.scale(bc, tmpV2);
        tmpV1.vsub(tmpV2, norm);
        norm.normalize();
        return norm;
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
    private _getFarthestPointInDirection(vertices: Vec3[], d: Vec3) {
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
     * ret {Object} Informations about the nearest edge (distance, index and normal).
     */
    private _getNearestEdge(simplex: Simplex) {
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
     */
    private _getNearestTriangle(polytope: Triangle[], result:EPA_NearestInfo) {
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
			// dir是线段和原点形成的平面上与线段垂直的指向原点的方向
            this._getNormal(ab, ao, ab, dir);
        } else {
            dir.copy(ao);
        }
        // 线段永远返回false，必须要组成四面体才能结束
        return false;
    }

    /**
	 * 当有三个点的时候，确定下一个采样方向
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
        var ab = b.vsub(a, _containsTriangle_ab);
        var ac = c.vsub(a, _containsTriangle_ac);
		var ao = a;

        var abp = this._getNormal(ac,ab,ab, _containsTriangle_abp);
        var acp = this._getNormal(ab,ac,ac, _containsTriangle_acp);

		// 先判断原点在ab的外面还是ac的外面
        if (abp.dot(ao) < 0) {
			// dir.copy(abp); 不能用abp，要朝向原点，abp并不朝向原点
			this._getNormal(ao,ab,ab,dir);	// dir = aox(ao x ab)  最后方向要与ao相反
			//ab.cross( ao.cross(ab,c1),dir);	// dir = ab x (ao x ab)
			//this._getNormal()
            // ab的外面，删掉c点，退化成线段继续。
            simplex.splice(0);	// 注意在getnormal后面splice，否则ao会变
        } else if (acp.dot(ao) < 0) {
			//dir.copy(acp);
			//ac.cross(ao.cross(ac,c1),dir); // dir = ac x (ao x ac)
			this._getNormal(ac,ao,ac,dir).negate(dir);	// acx(acxao) = -acxaoxac
            // ac的外面，删掉b点，退化成线段继续
            simplex.splice(1);
        } else {
			// 判断第三条边 。 对于三维来说，即使是从bc过来扩展的，对于这个三角形来说，依然可能在bc外面
			let bc =c.vsub(b,_containsTriangle_bc);
			let bcp = this._getNormal(ac,ab,bc, _containsTriangle_bcp);
			if(bcp.dot(b)<0){	// 这个要与b或者c dot
				//在bc外面
				this._getNormal(b,bc,bc,dir);	// boxbcxbc
				simplex.splice(2);// 去掉a
			}else{
				// 原点在ab和ac的里面，这时候要扩展成四面体了，
				// 确定在面的哪个方向
				// TODO 其实三角形的法线已经在前面求出过。修改 _getNormal为各种叉乘会提高效率。
				var abc = ab.cross(ac,_containsTriangle_abc);
				// 如果原点在平面下面
				if (abc.dot(ao) > 0) {
					//upside down tetrahedron
					pts[0] = b;
					pts[1] = c;
					pts[2] = a;
					dir.set(-abc.x, -abc.y, -abc.z);
				}else{
					dir.copy(abc);
				}
			}
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
     *                 3a 最后加的点
     *                / | \
     *               /  |  \
     *              /   |   \
     *            /     1c   \
     *          0d ---------- 2b
     *                 
     * @method _containsTetrahedron
     * @private
     * @param  simplex The simplex.
     * @param  dir The direction.
     * @return  Return true if the origin is in the tetrahedron.
     */
    _containsTetrahedron(simplex: Simplex, dir: Vec3) {
		let cls = CollisionGjkEpa;
        let pts = simplex.points;
        var a = pts[3];
        var b = pts[2];
        var c = pts[1];
        var d = pts[0];
        var ab = b.vsub(a,cls._containsTetrahedron_ab);
        var ac = c.vsub(a,cls._containsTetrahedron_ac);
        var ad = d.vsub(a,cls._containsTetrahedron_ad);
        var ao = a.negate(cls._containsTetrahedron_ao);

        // 检查四面体的除了底面的其他面的法线（反）是否指向原点。底面一定是指向的，因为a点就是根据底面的朝向获得的。
        var abc = ab.cross(ac,cls._containsTetrahedron_abc);
        var acd = ac.cross(ad,cls._containsTetrahedron_acd);
        var adb = ad.cross(ab,cls._containsTetrahedron_adb);

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
                switch(this._checkTetrahedron(ao, ab, ac, abc, dir)){
					case 0:
						simplex.tetrahedron2line(1,3);	// 从左边重新开始
						break;
					case 1:
						simplex.tetrahedron2line(2,3);	// 从右边重新开始
						break;
					case 2:
						simplex.splice(0);		// 去掉0点，从当前面重新开始
						break;
				}
				return false;
            case acdTest:
                // 如果只有acd朝向原点
				switch(this._checkTetrahedron(ao, ac, ad, acd, dir)){
					case 0:
						simplex.tetrahedron2line(1,3);
						break;
					case 1:
						simplex.tetrahedron2line(0,3);
						break;
					case 2:
						simplex.splice(2);
						break;
				}
				return false;
            case adbTest:
                // 如果只有adb朝向原点
                switch(this._checkTetrahedron(ao, ad, ab, adb, dir)){
					case 0:
						simplex.tetrahedron2line(2,3);
						break;
					case 1:
						simplex.tetrahedron2line(0,3);
						break;
					case 2:
						simplex.splice(1);
						break;
				}
				return false;
            case abcTest | acdTest:
                // 如果原点在两个面的正方向。
				// 如果在abc和acd的正方向
				// 需要去掉 abc和acd
                switch(this._checkTwoTetrahedron(ao, ab, ac, ad, abc, acd, dir)){
					case 0:
						simplex.tetrahedron2line(0,3);
						break;
					case 1:
						simplex.tetrahedron2line(1,3);
						break;
					case 2:
						simplex.splice(2);
						break;
					case 3:
						simplex.tetrahedron2line(2,3);
						break;
					case 4:
						simplex.splice(0);
						break;
				}
				return false;
            case acdTest | adbTest:
				switch(this._checkTwoTetrahedron(ao,ac,ad,ab,acd,adb,dir)){
					case 0:
						simplex.tetrahedron2line(2,3);
						break;
					case 1:
						simplex.tetrahedron2line(0,3);
						break;
					case 2:
						simplex.splice(1);
						break;
					case 3:
						simplex.tetrahedron2line(1,3);
						break;
					case 4:
						simplex.splice(2);
						break;
				}
				return false;
            case adbTest | abcTest:
				switch(this._checkTwoTetrahedron(ao,ad,ab,ac,adb,abc,dir)){
					case 0:
						simplex.tetrahedron2line(1,3);
						break;
					case 1:
						simplex.tetrahedron2line(2,3);
						break;
					case 2:
						simplex.splice(0);
						break;
					case 3:
						simplex.tetrahedron2line(0,3);
						break;
					case 4:
						simplex.splice(1);
						break;
				}
				return false;
            default:
				// 否则，四个面都指向原点，则包含原点
                return true;
        }
    }

    private static _checkTwoTetrahedron_abc_ac = new Vec3();
    /**
	 * 如果四面体有两个面朝向原点的时候，找到下一个最好的采样方向
	 * 在abc和acd的正方向。
	 * 
     *  ab,ac是第一个底面的两条边
     * 
	 * 如果原点在两个面的外面，则优先考虑这两个面的共同边的垂线
	 * 
     * @param ao 
     * @param ab  看向朝里的法线的时候的右边
     * @param ac  看向朝里的法线的时候的左边
     * @param abc 这个面的法线
     * @param dir  返回方向
     * @param simplex 
	 * @return  0,1,2 当前面的左边的面的 0,1,2   
	 * 			3 当前面的右边
	 * 			4 当前面的上方
     */
    private _checkTwoTetrahedron(ao: Vec3, ab: Vec3, ac: Vec3, ad:Vec3, abc: Vec3, acd:Vec3, dir: Vec3):int {
		// 当前面的左边(ac)朝向原点
		let abc_ac = abc.cross(ac,CollisionGjkEpa._checkTwoTetrahedron_abc_ac);
        if (abc_ac.dot(ao) > 0) {
			return this._checkTetrahedron(ao,ac,ad,acd,dir);
        }

		// 右边 
        let ab_abc = ab.cross(abc,CollisionGjkEpa._checkTwoTetrahedron_abc_ac);   // 另外一条边。重用变量
        if (ab_abc.dot(ao) > 0) {
			// 原点方向在ab外面，只保留ab就行（a3 b2 c1 d0）
            //dir is not ab_abc because it's not point towards the origin;
            //ABxA0xAB direction we are looking for
            this._getNormal(ab, ao, ab, dir);
            return 3;
		}
		
		// 否则的话，就是在abc的上方
		dir.copy(abc);
        return 4;
    }

	static _checkTetrahedron_acp = new Vec3();
	
    /**
     * 四面体只有一个面朝向原点，这时候只要处理这个面就行，根据这个面得到新的采样方向
     * @param ao    朝向原点的方向
     * @param ab 	从ao看向这个平面的右边
     * @param ac    从ao看向这个平面的左边
     * @param abc   ao底面的法线（朝向指向原点方向）
     * @param dir   输出新的采样方向
     * @param simplex 
	 * @returns 0 左边，1 右边，3 上面
     */
    private _checkTetrahedron(ao: Vec3, ab: Vec3, ac: Vec3, abc: Vec3, dir: Vec3 ):int {
        var acp = abc.cross(ac, CollisionGjkEpa._checkTetrahedron_acp);

        // 底面法线x左侧面 的方向是否朝向原点
        if (acp.dot(ao) > 0) {
            //dir is not abc_ac because it's not point towards the origin;
            //ACxA0xAC direction we are looking for
            this._getNormal(ac, ao, ac, dir);
            return 0;
        }

        //almost the same like triangle checks
        // 右侧面x底面法线 的方向是否朝向原点
        var ab_abc = ab.cross(abc, CollisionGjkEpa._checkTetrahedron_acp); // 重用上面的变量了
        if (ab_abc.dot(ao) > 0) {
            //dir is not ab_abc because it's not point towards the origin;
            //ABxA0xAB direction we are looking for
            this._getNormal(ab, ao, ab, dir);
            return 1;
        }

        // 如果左右两边都不朝向原点，只能用abc重新采样
        // 把第一个点去掉，退化成三角形。以abc所在三角形为（确定朝向原点）底面，用abc作为采样点，再来
        dir.copy(abc);
        return 2;
    }

    /**
	 * 这个先留着，以后做多面体的检测
     *
     * @method support
     * @param  shapei The convexe collider object.
     * @param  shapej The convexe collided object.
     * @param  direction The direction.
     * @return  The support points.
     */
    private _support(shapei: Vec3[], shapej: Vec3[], direction: Vec3, point:Vec3) {
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
	 * 判断原点是否在单形内，并确定下一个采样方向
	 * @param simplex 
	 * @param dir 
	 */
    containsOrigin(simplex: Simplex, dir: Vec3):boolean {
		switch( simplex.vertnum){
			case 2:
				return this._containsLine(simplex, dir);
			case 3:
				return this._containsTriangle(simplex, dir);
			case 4:
				return this._containsTetrahedron(simplex, dir);
			default:
				return false;
		}
    }

    /**
     * 注意 这里假设dir是没有规格化的
     * @param transA 
     * @param transB 
     * @param dir   	采样方向。没有normalize。
     * @param worldA 	A的世界坐标的support点
     * @param worldB  	B的世界坐标的support点
     * @param minkowPt  A-B得到Minkowski点
     */
    computeSupport(transA: Transform, transB: Transform, dir: Vec3, worldA: Vec3, worldB: Vec3, minkowPt: Vec3, dirNormed=false) {
        let A:MinkowskiShape = this.shapeA as MinkowskiShape;
        let B:MinkowskiShape = this.shapeB as MinkowskiShape;
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
		!dirNormed && dirA.normalize();

        let negDir = _check_NegDir;
        negDir.copy(dirA).negate(negDir);

        invqa.vmult(dirA,dirA);
        invqb.vmult(negDir,dirB);

		let supA = _computeSupport_Vec3;
		let supB = _computeSupport_Vec4;
		if(this.useMargin){
			A.getSupportVertexWithoutMargin(dirA,supA);
			B.getSupportVertexWithoutMargin(dirB,supB);
		}else{
			A.getSupportVertex(dirA,supA);
			B.getSupportVertex(dirB,supB);
		}

        // 转到世界空间
        transA.pointToWorld(supA,worldA);
        transB.pointToWorld(supB,worldB);
        worldA.vsub(worldB,minkowPt);
	}
	
	/**
	 * 
	 * @param hit minkowski上的碰撞点。基本在线上。
	 * @param wa  返回最近点对应的A的世界坐标
	 * @param wb  对应的B的世界坐标
	 */
	private getPtNearsetLine(hit:Vec3, wa:Vec3, wb:Vec3){
		let ab = new Vec3(); 	//TODO
		let ap = new Vec3();
		
		let simplex = this.simplex.points;
		let p1 = simplex[0];
		let p2 = simplex[1];
		p2.vsub(p1,ab);
		hit.vsub(p1,ap);
		let k = ap.dot(ab)/ab.dot(ab);
		if(k<=0){
			wa.copy(p1.worldA);
			wb.copy(p1.worldB);
			return;
		}else if(k>=1){
			wa.copy(p2.worldA);
			wb.copy(p2.worldB);
			return;
		}else{
			p2.worldA.vsub(p1.worldA,ab);
			p1.worldA.addScaledVector(k,ab,wa);
			p2.worldB.vsub(p1.worldB,ab);
			p1.worldB.addScaledVector(k,ab,wb);
		}
	}

	private getPtNearsetTri(hit:Vec3, wa:Vec3, wb:Vec3){
		let bc = new Vec3(); 	//TODO
		
		let simplex = this.simplex.points;
		let p1 = simplex[0];
		let p2 = simplex[1];
		let p3 = simplex[2];
		calcBarycentricCoord(hit,p1,p2,p3,bc);
		if(bc.x<0)bc.x=0;
		if(bc.x>1)bc.x=1;
		if(bc.y<0)bc.y=0;
		if(bc.y>1)bc.y=1;
		if(bc.z<0)bc.z=0;
		if(bc.z>1)bc.z=1;
		calcPtInTriangle(bc,p1.worldA,p2.worldA,p3.worldA,wa);
		calcPtInTriangle(bc,p1.worldB,p2.worldB,p3.worldB,wb);
	}

	/**
	 * 在margin内发现了一个分离面，这时候可以立即得到碰撞信息。
	 * @param ndir 	最后一个单形的垂线
	 * @param margin 两个margin的和
	 * @param d 	原点到最后的单形的距离
	 * @param minkpt 最后的采样点
	 */
	private getHitInfoByMargin(ndir:Vec3, margin:number, d:number, minkpt:minkVec3){
		let hitresult = this.hitResult;
		let hitA = hitresult.hitA;
		let hitB = hitresult.hitB;
		let hitNorm = hitresult.hitNorm;	// 需要是B指向A
		let simplex = this.simplex;
		let hitpt = new Vec3(); 	//TODO
		//let len = minkpt.length();	// 采样点到原点的距离
		let A = this.shapeA as MinkowskiShape;
		let B = this.shapeB as MinkowskiShape;
		let hit = new Vec3();
		let wa =new Vec3();
		let wb = new Vec3();


		switch( simplex.vertnum){
			case 1:{
				// 这个应该不可能发生
				let len = minkpt.length();
				let deep = margin-len;
				hitNorm.set(minkpt.x, minkpt.y,minkpt.z);
				hitNorm.normalize();
				hitresult.deep = deep;
				minkpt.worldA.addScaledVector(-A.margin,hitNorm, hitA);	// hitnorm 是B指向A，所以要反过来
				minkpt.worldB.addScaledVector(B.margin, hitNorm, hitB);
				return deep;
			}
			case 2:{// 已经有一个点了，加上minkpt是两个点
				// 已经有一个点了，当前dir采样点在margin内，
				// 不能直接使用dir，因为外面已经计算为垂直于当前线段了（例如一个球与直立capsule的碰撞，当球撞到capsule的侧面的时候，当前的采样方向可能是斜着的，直接用的话肯定不对）
				// 按照两个球计算。考虑球和胶囊，当球撞到侧面和端的时候法线必然是不同的，所以无法用任何现成的dir
				// 原点在单形上的投影点
				hit.set( -ndir.x*d,-ndir.y*d,-ndir.z*d);
				// 计算出对应的AB的位置
				this.getPtNearsetLine(hit,wa,wb);
				let deep = hitresult.deep = Sphere.SpherehitSphere(A.margin, wa, B.margin, wb, hitA, hitNorm, hitB, false);
				//hitNorm.negate(hitNorm);
				return deep;
			}
			case 3:
				// 已经有两个点了，当前采样点与这个线段组成三角形。找原点与三角形的关系。
				hit.set(-ndir.x*d, -ndir.y*d, -ndir.z*d);
				this.getPtNearsetTri(hit,wa,wb);
				let deep = hitresult.deep = Sphere.SpherehitSphere(A.margin, wa, B.margin, wb, hitA, hitNorm, hitB, false);
				return deep;
			case 4:
				// 已经有三个点了，当前采样点与这个三角形组成四面体，找原点与四面体的关系
				hit.set(-ndir.x*d, -ndir.y*d, -ndir.z*d);


				//debugger;
				break;
			case 5:
				// 已经有4个点了，这种情况不可能发生，因为有4个点的情况下，如果还要采样，必然会退化成小于4个点
				break;
			default:
			break;
		}
		return -1;
	}

    /**
     * The GJK (Gilbert–Johnson–Keerthi) algorithm.
     * Computes support points to build the Minkowsky difference and
     * create a simplex. The points of the collider and the collided object
     * must be convexe.
     *
     * @return  The simplex or false if no intersection.
     */    
    gjk(transi: Transform, transj: Transform):GJKResult {
        var it = 0;
		var simplex = this.simplex;// new Simplex(); //TODO
		simplex.reset();

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

		var normdir = normedDir;
		normdir.copy(dir);
		normdir.normalize();

        // set the first support as initial point of the new simplex
        let minkowpt = new minkVec3();	//TODO 
        this.computeSupport(transi, transj,normdir, minkowpt.worldA,minkowpt.worldB,minkowpt,true);
        simplex.addvertex(minkowpt);

		let A = this.shapeA as MinkowskiShape;
		let B = this.shapeB as MinkowskiShape;
		let margin = A.margin+B.margin;

		let lastDist = 0;	// 上一次单形到原点的距离，这个应该越来越近

		let d = minkowpt.dot(normdir);
        if (d <= 0) {
			if(this.useMargin){
				if(margin>-d){
					//debugger;
				}else{
					return GJKResult.NOCD; 	// 超出margin了，没有碰撞
				}
			}else{
				// 没有发生碰撞
				// TODO 这个没有考虑margin优化
				return GJKResult.NOCD;
			}
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

			normdir.copy(dir);
			normdir.normalize();
	
			// 计算原点到当前单形的距离
			// 由于dir是根据朝向算出来的，所以-d一定是大于0的
			let d1 = -simplex.points[0].dot(normdir);
			//console.log('dist=',d1);
			if(it>0 && d1>=lastDist){
				// 无法更靠近了，
				if(this.useMargin && d1<margin){
					this.getHitInfoByMargin(normdir,margin,d1,minkowpt);
					//console.log('gjk it=',it);
					return GJKResult.INMARGIN;
				}
			}
			lastDist = d1;

            // TODO 没有记录对应i,j的全局点
			this.computeSupport(transi,transj,normdir,minkowpt.worldA, minkowpt.worldB,minkowpt,true);
			d = minkowpt.dot(normdir);
			// 如果这个点已经有了，表示无法继续采样了
			if(simplex.hasPoint(minkowpt)){
				// 这时候如果是边界碰撞,则原点一定在最后的单形上
				if( d>-margin){
					this.getHitInfoByMargin(normdir,margin,-d,minkowpt);
					//console.log('gjk it=',it);
					return GJKResult.INMARGIN;
				}else{
					//debugger;
				}
			}

            if (d <= 0) {
				if(this.useMargin && -d<margin){
					// 在margin范围内，继续

					// 如果已经是三角形了，且新的点在三角形上，则表示这是在壳上的面了
					if(simplex.isPtInTri(minkowpt, normdir)){
						this.getHitInfoByMargin(normdir,margin,-d,minkowpt);
						//console.log('gjk it=',it);
						return GJKResult.INMARGIN;
					}else{
						// 继续
					}
				}else{
					// 没有发生碰撞
					// TODO 这个没有考虑margin优化
					//console.log('gjk it=',it);
					return GJKResult.NOCD;
				}

            }

            simplex.addvertex(minkowpt);
            // otherwise we need to determine if the origin is in
            // the current simplex
			// 如果单形包含原点了，则发生碰撞了。
			// TODO 现在的dir有的规格化了，有的没有
            if (this.containsOrigin(simplex, dir)) {
				//console.log('gjk it=',it);
                return GJKResult.NEEDEPA;
			}
            it++;
		}
		//console.log('gjk it=',it);
        return GJKResult.NOCD;
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
			let nearestpt =  findResponseWithTriangle_nearest;
			triangle.n.scale(-nearest.distance,nearestpt);
			let bc= findResponseWithTriangle_bc;
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

			if(edges.length==0){
				// 所有的面都朝向这个点，通常是浮点误差表示，这时候表示无法更靠近了，就用上面的作为碰撞信息就行
				triangle.n.negate(hitNorm);
				// 计算Minkowsky上的最近点
				let nearestpt =  findResponseWithTriangle_nearest;
				triangle.n.scale(-nearest.distance,nearestpt);
				let bc= findResponseWithTriangle_bc;
				calcBarycentricCoord(nearestpt,triangle.a, triangle.b,triangle.c, bc);
				// 计算碰撞点
				calcPtInTriangle(bc,triangle.a.worldA,triangle.b.worldA,triangle.c.worldA,hitA);
				calcPtInTriangle(bc,triangle.a.worldB,triangle.b.worldB,triangle.c.worldB,hitB);
				return nearest.distance;				
			}
            // create new triangles from the edges in the edge list
            for (let i = 0,l=edges.length; i < l; i++) {
                let edge = edges.edges[i];
                triangle = new Triangle(sup, edge.a, edge.b);   //TODO 效率
                if (triangle.n.lengthSquared() !== 0) {
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
		var polytope = this._polytope;
		polytope.length=4;
        // 注意顺序
		polytope[0].init(pts[0], pts[1], pts[2]);
		polytope[1].init(pts[0], pts[2], pts[3]);
		polytope[2].init(pts[0], pts[3], pts[1]);
		polytope[3].init(pts[1], pts[3], pts[2]);

        var max = 1000;// TODO 最多扩展次数
        while (it < max) {
            //if (pts[0].z === undefined) {
                // 2D的情况
                //response = this.findResponseWithEdge(colliderPoints, collidedPoints, simplex);
            //} else {
                // 3D的情况
                deep = this.findResponseWithTriangle(transA, transB, polytope, hitA, hitB, hitNorm);
            //}
            if (deep>0) {
				//console.log('epait=',it);
				return deep;
            }
            it++;
		}
		//console.log('epait=',it);
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
/*
	let transa  = JSON.parse( `{"position":{"x":3.047712156903969,"y":7.238084823732435,"z":5.3513835448599},"quaternion":{"x":7.633624811061411e-8,"y":2.863294548138404e-7,"z":-7.981622297533533e-16,"w":0.9999999999999563}}`);
		transA.position.copy(transa.position);
		transA.quaternion.copy(transa.quaternion);
*/

/*
	// epa迭代1000次的例子
	let transa = JSON.parse(`{"position":{"x":-1.012593433428434,"y":10.799216498665817,"z":0.5586403603301122},"quaternion":{"x":0.7639201612548266,"y":-0.02076238836886444,"z":-0.07677177733184969,"w":0.6403912902772247}}`);
	transA.position.copy(transa.position);
	transA.quaternion.copy(transa.quaternion);
*/
/*
	let transa = JSON.parse(`{"position":{"x":-3.629106999975412,"y":10.795690566386964,"z":-5.02737115423355},"quaternion":{"x":-0.4349174512832908,"y":0.012517727147505158,"z":0.031959456897814036,"w":-0.8998159312832285}}`);
	transA.position.copy(transa.position);
	transA.quaternion.copy(transa.quaternion);
*/
/*
	//let transa = JSON.parse(`{"position":{"x":-0.9185988583792287,"y":6.554776762299604,"z":3.27601564867931},"quaternion":{"x":0,"y":0,"z":0,"w":1}}`);
	let transa = JSON.parse(`{"position":{"x":-1.777604274568285,"y":5.160385130854598,"z":1.163047889483976},"quaternion":{"x":0,"y":0,"z":0,"w":1}}`);
	transA.position.copy(transa.position);
	transA.quaternion.copy(transa.quaternion);
*/

/*
	let transa = JSON.parse(`{"position":{"x":-4.6925864018753805,"y":-5.167927209183408,"z":4.691472874455349},"quaternion":{"x":0,"y":0,"z":0,"w":1}}`);
	transA.position.copy(transa.position);
	transA.quaternion.copy(transa.quaternion);
*/

	//let transa = JSON.parse(`{"position":{"x":-4.5740800221984745,"y":-4.312985167434549,"z":-4.965853288462039},"quaternion":{"x":0,"y":0,"z":0,"w":1}}`);
	//transA.position.copy(transa.position);
	//transA.quaternion.copy(transa.quaternion);
//DEBUG

		let hitresult = this.hitResult;
		hitresult.hitA=hitA;
		hitresult.hitB=hitB;
		hitresult.hitNorm = hitNorm;
		hitresult.deep=-1;

		let needepa = false;
        var ret = this.gjk(transA, transB);
		switch( ret){
			case GJKResult.NEEDEPA:
				needepa=true;
				break;
			case GJKResult.INMARGIN:
				return hitresult.deep;
			default:
				return -1;
		}
		// 这时候必然发生碰撞了。
		if(justtest)
			return 1;

		let simplex = this.simplex;
		if (needepa) {
				// 在gjk阶段已经得到碰撞信息了
			// 根据simplex和两个shape来得到碰撞信息
			let deep = this.getResponse(transA, transB, simplex,hitA,hitB, hitNorm);
			if(deep<0){
				return -1;
			}
			return deep;			
        }

        return -1;
    }

}