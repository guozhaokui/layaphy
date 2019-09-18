import { MinkowskiShape } from "../shapes/MinkowskiShape";
import Transform from "../math/Transform";
import Vec3 from "../math/Vec3";

class MinkowskiDiff {
	EnableMargin(b: boolean): void {

	}
}

class SupportVector {
	v = new Vec3();		// minkowski sum
	v1 = new Vec3();	//obj1 世界空间
	v2 = new Vec3();	//obj2 世界空间
	constructor(a_b?: Vec3, a?: Vec3, b?: Vec3) {
		a_b && (this.v = a_b);
		a && (this.v1 = a);
		b && (this.v2 = b);
	}
}

var PHYEPS = 1e-6;
var NPHYEPS = -1e-6;
function nearZeroF(v: number) {
	return v > NPHYEPS && v < PHYEPS;
}

var ORIGIN = new Vec3(0, 0, 0);
class Simplex {
	supportVertex = [new SupportVector(), new SupportVector(), new SupportVector(), new SupportVector()];
	lastAddIdx = -1;
	reset() {
		this.lastAddIdx = -1;
	}

	// 以copy的方法添加
	addCopy(s: SupportVector) {
		this.setCopy(++this.lastAddIdx, s);
	}

	setCopy(idx: i32, s: SupportVector) {
		let c = this.supportVertex[idx];
		let v = s.v; let v1 = s.v1; let v2 = s.v2;
		c.v.set(v.x, v.y, v.z);
		c.v1.set(v1.x, v1.y, v1.z);
		c.v2.set(v2.x, v2.y, v2.z);
	}

	simplexSize() {
		return this.lastAddIdx + 1;
	}

	/**
	 * 
	 * @param dir  注意dir会被修改，以便算法继续
	 * @return -1 没有相交， 0 需要继续   1 碰撞了
	 */
	doSimplex(dir: Vec3): i32 {
		let simplexSize = this.simplexSize();
		if (simplexSize == 2) {
			//simplex只是一个线段
			return this.doSimplex2(dir);
		} else if (simplexSize == 3) {
			//simplex是一个三角形
			return this.doSimplex3(dir);
		} else {
			//simpsize=4
			//simplex是一个四面体。 只有四面体能包含原点，其他的都是on而不是in
			return this.doSimplex4(dir);
		}
	}

	/**
	 * 判断原点是不是在线段上。根据原点的位置更新simplex，并计算新的dir
	 * @param dir 
	 */
	doSimplex2(dir: Vec3): i32 {
		let supVert = this.supportVertex;
		// A是上一次添加的
		let A = supVert[this.lastAddIdx];
		// 另外一个
		let B = supVert[0];

		let AB = new Vec3();
		B.v.vsub(A.v, AB);

		let AO = new Vec3();
		AO.copy(A.v); AO.negate(AO);	//AO = -A.v。 AO是从A指向原点
		let dot = AO.dot(AB);
		let tmp = new Vec3();
		AB.cross(AO, tmp);
		if (nearZeroF(tmp.dot(tmp)) && dot > 0) {
			//原点在线段上。AO，AB共线，且AO，AB同向（O在AB中间）
			return 1;
		}
		// 原点不在线段上，确定在线段的哪一侧，作为新的方向
		if (dot < PHYEPS) {
			// <0 表示当前的方向（AB）不对，o在AB的反向，从最后加的点重新算，方向变成AO
			this.setCopy(0, A);
			this.lastAddIdx = 1;
			dir.copy(AO);
		} else {
			// 方向要垂直于AB
			AB.cross(AO, dir).cross(AO, dir);//dir = ABxAOxAB
		}
		return 0;
	}

	doSimplex3(dir: Vec3): i32 {
		//TODO new 
		let AO = new Vec3();
		let AB = new Vec3();
		let AC = new Vec3();
		let ABC = new Vec3();
		let tmp = new Vec3();

		let supVert = this.supportVertex;
		// A是上一次添加的
		let A = supVert[this.lastAddIdx];
		// 另外两个
		let B = supVert[1];
		let C = supVert[0];

		let dist = this.ptTriDist2(ORIGIN, A.v, B.v, C.v);
		if(nearZeroF(dist)){
			// 原点在三角形上，相交了
			return 1;
		}
		if(A.v.almostEquals(B.v) || A.v.almostEquals(C.v)){
			// 够不成三角形，没有碰到
			return -1;
		}

		AO.copy(A.v).negate(); //AO = -A.v
		B.v.vsub(A.v,AB);
		C.v.vsub(A.v,AC);
		AB.cross(AC, ABC);	// ABC = ABxAC
		ABC.cross(AC,tmp);	// tmp = ABCxAC = ABXACXAC

		// 判断原点在三角形的哪一面
		let dot = tmp.dot(AO);	// 假设tmp是上方
		if(dot>=0){
			// 在三角形上方
			dot = AC.dot(AO);
			if(dot>=0){
				//原点在 AC方向。C是合适的
				this.setCopy(1,A);
				this.lastAddIdx=2;
				AC.cross(AO,dir).cross(AC,dir);	//dir=ACxAOxAC
			}else{
				//原点在 AC反方向
				dot = AB.dot(AO);
				if(dot>=0){
					this.setCopy(0,B);
					this.setCopy(1,A);
					this.lastAddIdx=2;
					AB.cross(AO,dir).cross(AB,dir);	//dir=ABxAOxAB
				}else{
					this.setCopy(0,A);
					this.lastAddIdx=1;	// 0=A, 1=B
					dir.copy(AO);
				}
			}
		}else{
			// 在三角形下方
			AB.cross(ABC,tmp);
			dot = tmp.dot(AO);
			if(dot>=0){
				dot=AB.dot(AO);
				if(dot>=0){
					this.setCopy(0,B);
					this.setCopy(1,A);
					this.lastAddIdx=2;
					AB.cross(AO,dir).cross(AB,dir); //dir = ABxAOxAB
				}else{
					// 退成线段
					this.setCopy(0,A);
					this.lastAddIdx=1;
					dir.copy(AO);
				}
			}else{
				dot = ABC.dot(AO);
				if(dot>=0){
					dir.copy(ABC);	// dir = ABC
				}else{
					// 交换 [0],[1]
					let tmp = supVert[0];
					supVert[0]=supVert[1];
					supVert[1]=tmp;
					dir.copy(ABC).negate();	// dir = -ABC
				}
			}
		}
		return 0;
	}

	doSimplex4(dir: Vec3): i32 {

	}

	/**
	 * 点到线段的距离的平方。
	 * @param P 
	 * @param v0 
	 * @param v1 
	 * @param witness 见证点。最近的点
	 */
	PointSegmentDist2(P: Vec3, v0: Vec3, v1: Vec3, witness:Vec3|null=null) {
		// The computation comes from solving equation of segment:
		//      S(t) = V0 + t.d
		//          where - V0 is initial point of segment
		//                - d is direction of segment from x0 (|d| > 0)
		//                - t belongs to <0, 1> interval
		//
		// Than, distance from a segment to some point P can be expressed:
		//      D(t) = |V0 + t.d - P|^2
		//          which is distance from any point on segment. Minimization
		//          of this function brings distance from P to segment.
		// Minimization of D(t) leads to simple quadratic equation that's
		// solving is straightforward.
		//
		// Bonus of this method is witness point for free.

		let t: number;
		let d = new Vec3(), a = new Vec3();
		let d1 = new Vec3();

		// direction of segment
		v1.vsub(v0, d);

		// precompute vector from P to x0
		v0.vsub(P, a);	// PX0=x0-P

		t = -a.dot(d);
		t /= d.dot(d);

		if (t <=0 ) {// 按照起点计算
			v0.vsub(P, d1);
		}else if(t>1){// 按照终点计算
			v1.vsub(P,d1);
		}else{
			// 最近点在中间
			a.addScaledVector(t,d,d1);	// a+d*t = v0+a+d*t -v0
		}
		return d1.dot(d1);
	}

	/**
	 * 点到三角形的距离的平方
	 * @param pt 
	 * @param v0 
	 * @param v1 
	 * @param v2 
	 */
	ptTriDist2(pt: Vec3, v0: Vec3, v1: Vec3, v2: Vec3) {
		let d1 = new Vec3();
		let d2 = new Vec3();
		let a = new Vec3();
		v1.vsub(v0, d1);	// v0v1
		v2.vsub(v0, d2);	// v0v2
		v0.vsub(pt, a);	// ptv0
		let dist = 0, dist2=0; 	// 初始值应该是多少
		let u = a.dot(a);
		let v = d1.dot(d1);
		let w = d2.dot(d2);
		let p = a.dot(d1);
		let q = a.dot(d2);
		let r = d1.dot(d2);

		// T(s,t) = v0 + s*d1+t*d2
		// 计算出s,t以后，就能得到出T，T是pt在三角形平面上的投影，||pt-T||就是距离
		let s = (q * r - w * p) / (w * v - r * r);
		let t = (-s * r - q) / w;

		if ((s >= 0) && ( s<=1) && (t>=0) && (t<=1) && ( t+s<=1)) {
			// 如果落在在三角形内
			dist = s * s * v;
			dist += t * t * w;
			dist += 2 * s * t * r;
			dist += 2 * s * p;
			dist += 2 * t * q;
			dist += u;
		}else{
			// 跟三个边求距离，取最小的。
			dist = this.PointSegmentDist2(pt,v0,v1,null);
			dist2 = this.PointSegmentDist2(pt, v0, v1, null);
			if (dist2 < dist) {
				dist = dist2;
			}
			dist2 = this.PointSegmentDist2(pt, v1, v2, null);
			if (dist2 < dist) {
				dist = dist2;
			}
		}
		return dist;
	}
}

var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();

var _computeSupport_Vec1 = new Vec3();
var _computeSupport_Vec2 = new Vec3();
var _computeSupport_Vec3 = new Vec3();
var _computeSupport_Vec4 = new Vec3();
class GJKPairDetector {
	shapeA: MinkowskiShape;
	shapeB: MinkowskiShape;

	/**
	 * 计算A和B的最近点
	 * @param transA 
	 * @param transB 
	 */
	getClosestPoint(transA: Transform, transB: Transform) {
		let cen = tmpVec1;	// 两个对象的中点
		transA.position.vadd(transB.position, cen).scale(0.5, cen);
		let maxIt = 1000;
		let curIt = 0;

		let sepAix = tmpVec2;
		sepAix.set(0, 1, 0);
		let margin = 0;

		let simp1 = new Simplex();
		let dir = new Vec3(1, 0, 0);	// 先随便假设一个方向。如果不对的话，以后会修改
		let worldA = new Vec3();
		let worldB = new Vec3();
		let AminB = new Vec3();
		this.computeSupport(transA, transB, dir, worldA, worldB, AminB);

		let last = new SupportVector(AminB, worldA, worldB);
		simp1.addCopy(last);
		AminB.negate(dir);	// dir = -AminB
		let status = -2;
		for (let i = 0; i < maxIt; i++) {
			this.computeSupport(transA, transB, dir, worldA, worldB, AminB);
			let delta = AminB.dot(dir);
			if (delta < 0) {
				// 当前检测方向，与当前支撑点，在原点的同一侧。例如w在原点的左侧，却对应超右的支撑方向，即w已经在最右边了，依然在左侧，则没有碰撞
				status = -1;
				break;
			}
			// 继续添加单体
			last.v = AminB;
			last.v1 = worldA;
			last.v2 = worldB;
			simp1.addCopy(last);

			//let newDir = new Vec3();
			let r = simp1.doSimplex(dir);
			if (r == 1) {
				// 确定碰撞了
				status = 0;
				break;
			} else if (r == -1) {
				// 确定没有碰撞
				status = -1;
				break;
			}
			if (nearZeroF(dir.dot(dir))) {
				// 没有碰撞
				status = -1;
				break;
			}
			if (dir.almostZero()) {
				status = -1;
				break;
			}
		}
	}

	/**
	 * 获得A，B的support点，以及A-B
	 * @param transA 
	 * @param transB 
	 * @param dir 
	 * @param worldA 
	 * @param worldB 
	 * @param aMinB 
	 */
	computeSupport(transA: Transform, transB: Transform, dir: Vec3, worldA: Vec3, worldB: Vec3, aMinB: Vec3) {
		let A = this.shapeA;
		let B = this.shapeB;
		//先把dir转换到本地空间
		let dirA = _computeSupport_Vec1;
		let dirB = _computeSupport_Vec2;
		transA.pointToLocal(dir, dirA);
		transB.pointToLocal(dir, dirB);

		let supA = _computeSupport_Vec3;
		let supB = _computeSupport_Vec4;
		A.getSupportVertex(dirA, supA);
		B.getSupportVertex(dirB, supB);
		// 转换到世界空间
		transA.pointToWorld(supA, worldA);
		transB.pointToWorld(supB, worldB);
		worldA.vsub(worldB, aMinB);
	}


	simplexAdd() {

	}
}