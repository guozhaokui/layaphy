import { MinkowskiShape } from "../shapes/MinkowskiShape";
import Transform from "../math/Transform";
import Vec3 from "../math/Vec3";
import { VoronoiSimplexSolver } from "./VoronoiSimplexSolver";
import { sResults, Penetration, Distance, MinkowskiDiff } from "./GJKEPA2";
import { PhyRender } from "../layawrap/PhyRender";

const PHYEPSILON = 1e-10;	//
const PHYEPS2 = PHYEPSILON ** 2;

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
	lastAddIdx = -1;	// 最后一个添加的位置
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
		if (nearZeroF(dist)) {
			// 原点在三角形上，相交了
			return 1;
		}
		if (A.v.almostEquals(B.v) || A.v.almostEquals(C.v)) {
			// 够不成三角形，没有碰到
			return -1;
		}

		AO.copy(A.v).negate(); //AO = -A.v
		B.v.vsub(A.v, AB);
		C.v.vsub(A.v, AC);
		AB.cross(AC, ABC);	// ABC = ABxAC
		ABC.cross(AC, tmp);	// tmp = ABCxAC = ABXACXAC

		// 判断原点在三角形的哪一面
		let dot = tmp.dot(AO);	// 假设tmp是上方
		if (dot >= 0) {
			// 在三角形上方
			dot = AC.dot(AO);
			if (dot >= 0) {
				//原点在 AC方向。C是合适的
				this.setCopy(1, A);
				this.lastAddIdx = 2;
				AC.cross(AO, dir).cross(AC, dir);	//dir=ACxAOxAC
			} else {
				//原点在 AC反方向
				dot = AB.dot(AO);
				if (dot >= 0) {
					this.setCopy(0, B);
					this.setCopy(1, A);
					this.lastAddIdx = 2;
					AB.cross(AO, dir).cross(AB, dir);	//dir=ABxAOxAB
				} else {
					this.setCopy(0, A);
					this.lastAddIdx = 1;	// 0=A, 1=B
					dir.copy(AO);
				}
			}
		} else {
			// 在三角形下方
			AB.cross(ABC, tmp);
			dot = tmp.dot(AO);
			if (dot >= 0) {
				dot = AB.dot(AO);
				if (dot >= 0) {
					this.setCopy(0, B);
					this.setCopy(1, A);
					this.lastAddIdx = 2;
					AB.cross(AO, dir).cross(AB, dir); //dir = ABxAOxAB
				} else {
					// 退成线段
					this.setCopy(0, A);
					this.lastAddIdx = 1;
					dir.copy(AO);
				}
			} else {
				dot = ABC.dot(AO);
				if (dot >= 0) {
					dir.copy(ABC);	// dir = ABC
				} else {
					// 交换 [0],[1]
					let tmp = supVert[0];
					supVert[0] = supVert[1];
					supVert[1] = tmp;
					dir.copy(ABC).negate();	// dir = -ABC
				}
			}
		}
		return 0;
	}

	doSimplex4(dir: Vec3): i32 {
		let supVerts = this.supportVertex;
		let A = supVerts[this.lastAddIdx];
		let B = supVerts[2];
		let C = supVerts[1];
		let D = supVerts[0];

		// 检查四面体是否有效,最后加的点如果在三角形上就不行
		let dist = this.ptTriDist2(A.v, B.v, C.v, D.v);
		if (nearZeroF(dist)) {
			return -1;	// 新加的点没有扩展成体，还在三角面上，这种情况表示没有碰撞
		}
		// 检查四个面，原点是否在这四个面上，是的话，表示碰撞了
		dist = this.ptTriDist2(ORIGIN, A.v, B.v, C.v);
		if (nearZeroF(dist))
			return 1;
		dist = this.ptTriDist2(ORIGIN, A.v, C.v, D.v);
		if (nearZeroF(dist))
			return 1;
		dist = this.ptTriDist2(ORIGIN, A.v, B.v, D.v);
		if (nearZeroF(dist))
			return 1;
		dist = this.ptTriDist2(ORIGIN, B.v, C.v, D.v);
		if (nearZeroF(dist))
			return 1;

		let AO = new Vec3();
		let AB = new Vec3();
		let AC = new Vec3();
		let AD = new Vec3();
		let ABC = new Vec3();
		let ACD = new Vec3();
		let ADB = new Vec3();

		AO.copy(A.v).negate();	// AO = -A.v
		B.v.vsub(A.v, AB);	//AB=B-A
		C.v.vsub(A.v, AC); 	//AC=C-A
		D.v.vsub(A.v, AD);	//AD=D-A
		AB.cross(AC, ABC);	// ABC平面的法线
		AC.cross(AD, ACD);	// ACD平面的法线
		AD.cross(AB, ADB);	// ADB平面的法线

		throw 'NI';

	}

	/**
	 * 点到线段的距离的平方。
	 * @param P 
	 * @param v0 
	 * @param v1 
	 * @param witness 见证点。最近的点
	 */
	PointSegmentDist2(P: Vec3, v0: Vec3, v1: Vec3, witness: Vec3 | null = null) {
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

		if (t <= 0) {// 按照起点计算
			v0.vsub(P, d1);
		} else if (t > 1) {// 按照终点计算
			v1.vsub(P, d1);
		} else {
			// 最近点在中间
			a.addScaledVector(t, d, d1);	// a+d*t = v0+a+d*t -v0
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
		let dist = 0, dist2 = 0; 	// 初始值应该是多少
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

		if ((s >= 0) && (s <= 1) && (t >= 0) && (t <= 1) && (t + s <= 1)) {
			// 如果落在在三角形内
			dist = s * s * v;
			dist += t * t * w;
			dist += 2 * s * t * r;
			dist += 2 * s * p;
			dist += 2 * t * q;
			dist += u;
		} else {
			// 跟三个边求距离，取最小的。
			dist = this.PointSegmentDist2(pt, v0, v1, null);
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

var calcdepth_v1 = new Vec3();
let guessVectors = [
	new Vec3(),	//o2-o1
	new Vec3(),		//o1-o2
	new Vec3(0, 0, 1),
	new Vec3(0, 1, 0),
	new Vec3(1, 0, 0),
	new Vec3(1, 1, 0),
	new Vec3(1, 1, 1),
	new Vec3(0, 1, 1),
	new Vec3(1, 0, 1),
];

var  calcPenDepth_results = new sResults();
/**
 * 用EPA算法找到碰撞深度
 */
class GjkEpaPenetrationDepthSolver {
	calcPenDepth(simplexSolver: VoronoiSimplexSolver, pConvexA:MinkowskiShape, pConvexB:MinkowskiShape, transformA: Transform, transformB: Transform, v: Vec3, wWitnessOnA: Vec3, wWitnessOnB: Vec3) {
		let o1 = transformA.position;
		let o2 = transformB.position;
		let d1 = calcdepth_v1;
		o1.vsub(o2, d1);
		d1.normalize();		//BA矢量

		let guessVecs = guessVectors;
		guessVecs[0].set(-d1.x, -d1.y, -d1.z);	//o2-o1
		guessVecs[1].set(d1.x, d1.y, d1.z);		//o1-o2

		let numVectors = guessVecs.length;
		let results = calcPenDepth_results;
		//各个方向来一次
		for (let i = 0; i < numVectors; i++) {
			simplexSolver.reset();
			let guessVector = guessVecs[i];
			if (Penetration(pConvexA, transformA, pConvexB, transformB, guessVector, results)) {
				wWitnessOnA.copy(results.witnessA);
				wWitnessOnB.copy(results.witnessB);
				v.copy(results.normal);
				return true;
			} else {
				return false;// 并不想要计算距离。下面的代码还没验证
				if (Distance(pConvexA, transformA, pConvexB, transformB, guessVector, results)) {
					wWitnessOnA.copy(results.witnessA);
					wWitnessOnB.copy(results.witnessB);
					v.copy(results.normal);
					return false;
				}
			}
		}

		//failed to find a distance/penetration 算法失败了
		wWitnessOnA.set(0, 0, 0);
		wWitnessOnB.set(0, 0, 0);
		v.set(0, 0, 0);
		return false;
	}
}

var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();

var _computeSupport_Vec1 = new Vec3();
var _computeSupport_Vec2 = new Vec3();
var _computeSupport_Vec3 = new Vec3();
var _computeSupport_Vec4 = new Vec3();
export class GJKPairDetector {
	shapeA: MinkowskiShape;
	shapeB: MinkowskiShape;
	simplexSolver = new VoronoiSimplexSolver();
	penetrationDepthSolver = new GjkEpaPenetrationDepthSolver();
	marginA = 0;
	marginB = 0;

	/**
	 * 计算A和B的最近点
	 * @param transA 
	 * @param transB 
	 */
	getClosestPoint1(transA: Transform, transB: Transform) {
		// 把transform改成相对于两个对象中心的
		let cen = tmpVec1;
		let oldTransA = transA.position;
		let oldTransB = transB.position;
		transA.position = new Vec3();		// 记得后面要恢复
		transB.position = new Vec3();
		transA.position.vadd(transB.position, cen).scale(0.5, cen);
		oldTransA.vsub(cen, transA.position);	// tranA.postion -= center;
		oldTransB.vsub(cen, transB.position);

		let maxIt = 1000;
		let curIt = 0;

		let sepAxis = tmpVec2;
		sepAxis.set(0, 1, 0);
		let margin = 0;

		let simp1 = new Simplex();
		let dir = new Vec3(1, 0, 0);	// 先随便假设一个方向。如果不对的话，以后会修改
		let worldA = new Vec3();
		let worldB = new Vec3();
		let AminB = new Vec3();
		this.computeSupport(transA, transB, dir, worldA, worldB, AminB, false);

		let last = new SupportVector(AminB, worldA, worldB);
		simp1.addCopy(last);
		AminB.negate(dir);	// dir = -AminB
		let status = -2;
		for (let i = 0; i < maxIt; i++) {
			this.computeSupport(transA, transB, dir, worldA, worldB, AminB, false);	//TODO 这个能简化一下么，里面空间转换太多
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

		//simplexSolver.reset()
		// 另外一种方法
		/** 碰撞点的B上的法线 */
		let normalInB = new Vec3(0, 0, 0);
		let squaredDistance = 1e20;
		let checkSimplex = false;
		let degenerateSimplex = 0;
		let REL_ERROR2 = 1e-12;
		let simpSolver = this.simplexSolver;
		while (true) {
			this.computeSupport(transA, transB, sepAxis, worldA, worldB, AminB, true);//TODO dir谁取反的问题
			let delta = sepAxis.dot(AminB);
			if (delta <= 0) {// =? 如果沿着dir方向取A,沿着反向取B，但是dot却<0表示两个对象是分离的
				// 即找到了一个dir方向能把对象分离
				checkSimplex = true;
				degenerateSimplex = 10;
				break;
			}

			// 新得到的点已经在smplex中了，表示无法更接近了
			if (simpSolver.inSimplex(AminB)) {
				degenerateSimplex = 1;
				checkSimplex = true;
				break;
			}

			// 再近一点

			let f0 = squaredDistance - delta;
			let f1 = squaredDistance * REL_ERROR2;
			if (f0 <= f1) {
				// 如果dist已经很小了
				if (f0 <= 0) {
					degenerateSimplex = 2;
				} else {
					degenerateSimplex = 11;
				}
				checkSimplex = true;
				break;
			}

			simpSolver.addVertex(AminB, worldA, worldB);
			let newSepAx = new Vec3();
			if (!simpSolver.closest(newSepAx)) {
				// 如果找不到更近的点
				degenerateSimplex = 3;
				checkSimplex = true;
				break;
			}
			if (newSepAx.lengthSquared() < REL_ERROR2) {
				sepAxis.copy(newSepAx);	//TODO 是不是可以用同一个对象
				degenerateSimplex = 6;
				checkSimplex = true;
				break;
			}

			let previousSquaredDistance = squaredDistance;
			squaredDistance = newSepAx.lengthSquared();

			if (previousSquaredDistance <= squaredDistance) {
				//新的分离轴没有更靠近？
				checkSimplex = true;
				degenerateSimplex = 12;
				break;
			}

			sepAxis.copy(newSepAx);

			let check = !simpSolver.fullSimplex();
			if (!check) {//if full
				degenerateSimplex = 13;
				break;
			}

			let pointOnA = new Vec3();
			let pointOnB = new Vec3();
			if (checkSimplex) {
				simpSolver.compute_points(pointOnA, pointOnB);
			}
		}

		// 恢复transform
		transA.position = oldTransB;
		transB.position = oldTransB;
	}

	/**
	 * 计算A和B的最近点
	 * @param transA 
	 * @param transB 
	 * @param hitNorm 把A推开的法线，即B身上的，朝向A的。
	 * @return 碰撞深度， <0表示没有碰撞，
	 */
	getClosestPoint(transA: Transform, transB: Transform,hitA:Vec3,hitB:Vec3, hitNorm:Vec3, justtest:boolean):f32 {
		//performance.clearMarks('getcloseptstart');
		//performance.clearMarks('getcloseptend');
		//performance.clearMeasures('getClosePoint');

		//performance.mark('getcloseptstart');
		//DEBUG
		//let phyr = PhyRender.inst;
		let phyr:PhyRender=(window as any).phyr;
		let showit:number = (window as any).dbgit;

		//DEBUG
		// 把transform改成相对于两个对象中心的
		let cen = tmpVec1;
		/* 先不做这个，直接用世界坐标
		let oldTransA = transA.position;
		let oldTransB = transB.position;
		transA.position = new Vec3();		// 记得后面要恢复
		transB.position = new Vec3();
		oldTransA.vadd(oldTransB, cen).scale(0.5, cen);
		oldTransA.vsub(cen, transA.position);	// tranA.postion -= center;
		oldTransB.vsub(cen, transB.position);
		*/

		let sepAxis = tmpVec2;
		sepAxis.set(0, 1, 0);
		let margin = this.shapeA.margin + this.shapeB.margin;
		let distance = 0;
		let isValid = false;	// sepAxis 有效

		let worldA = new Vec3();
		let worldB = new Vec3();
		let AminB = new Vec3();
		let normSep = new Vec3();	//规格化之后的测试轴

		let simpSolver = this.simplexSolver;
		simpSolver.reset();

		/** 碰撞点的B上的法线 */
		let normalInB = new Vec3(0, 0, 0);
		/** 分离轴的长度平方 */
		let squaredDistance = 1e20;
		let checkSimplex = false;
		let degenerateSimplex = 0;
		let collision=false;
		const REL_ERROR2 = 1e-12;
		let itNum=0;
		while (true) {
			let showdbg = showit==itNum;//debug
			itNum++;
			let sepLen = sepAxis.length();
			sepAxis.scale(1 / sepLen, normSep);	//TODO 这个是不是在computeSupport函数内部做更好
			this.computeSupport(transA, transB, normSep, worldA, worldB, AminB, true);//TODO dir谁取反的问题
			//DEBUG
			if(showdbg){
				phyr.addPoint(worldA.x+cen.x,worldA.y+cen.y,worldA.z+cen.z,0x77);
				phyr.addPoint(worldB.x+cen.x,worldB.y+cen.y,worldB.z+cen.z,0xff);
				phyr.addPoint(AminB.x,AminB.y,AminB.z,0xff0000);
				phyr.addVec(0,0,0,sepAxis.x,sepAxis.y,sepAxis.z,0xff00);
			}
			//DEBUG
			/** 新的采样点在采样方向上的投影。即采样点-原点 在采样方向的投影 */
			let delta = normSep.dot(AminB);
			if (delta < -margin) {// 如果沿着dir方向取A,沿着反向取B，但是dot却<0表示两个对象是分离的
				// 沿着采样方向采样minkow形，结果点在后面，则原点一定不在minkow形内
				// 相当于找到了一个dir方向能把对象分离
				// 由于采样的是没有margin的，因此要把marin考虑在内
				// 注意不能=，因为=算碰撞
				checkSimplex = true;
				degenerateSimplex = 10;
				collision=false;
				break;
			}

			// 新得到的点已经在smplex中了，表示无法更接近了
			if (simpSolver.inSimplex(AminB)) {
				degenerateSimplex = 1;
				checkSimplex = true;
				collision=true;
				break;
			}

			// 判断投影长度delta是不是超过了采样射线，超过了表示原点在里面
			// 投影长度约等于delta，表示原点就在采样起点上
			// 投影长度比采样向量大，由于原点一定在采样向量前面，投影长度大的话，说明采样点一定跨越了原点
			/*
			let f0 = squaredDistance - delta;// + margin;
			let f1 = squaredDistance * REL_ERROR2;
			if (f0 <= f1) {
				if (f0 <= 0) {
					degenerateSimplex = 2;
				} else {
					degenerateSimplex = 11;
				}
				checkSimplex = true;
				collision=true;
				break;
			}
			*/

			simpSolver.addVertex(AminB, worldA, worldB);

			let newSepAx = new Vec3();
			if (!simpSolver.closest(newSepAx)) {
				// 如果找不到更近的点
				degenerateSimplex = 3;
				checkSimplex = true;
				collision=true;
				break;
			}
			let newSepLen2 = newSepAx.lengthSquared();
			if ( newSepLen2 < REL_ERROR2) {
				// 如果分离轴已经很短了。表示最近点已经是原点了，原点在simplex上
				// 这种情况下，无法确定碰撞方向
				sepAxis.copy(newSepAx);	//TODO 是不是可以用同一个对象
				degenerateSimplex = 6;
				checkSimplex = true;
				collision=true;
				break;
			}

			let previousSquaredDistance = squaredDistance;
			squaredDistance = newSepLen2;// newSepAx.lengthSquared();

			if (previousSquaredDistance - squaredDistance <= previousSquaredDistance * 1e-10) {
				// 即 previousSquaredDistance<=squaredDistance 只是误差与previousSquaredDistance大小有关，避免都用相同误差
				//新的分离轴没有更靠近？
				checkSimplex = true;
				degenerateSimplex = 12;
				collision=true;
				break;
			}

			sepAxis.copy(newSepAx);

			let check = !simpSolver.fullSimplex();
			if (!check) {//if full
				degenerateSimplex = 13;
				break;
			}
		}
		//console.log('itnum=',itNum);

		if(!collision){
			return -1;
		}
		if(justtest)
			return 1;

		let pointOnA = new Vec3();
		let pointOnB = new Vec3();
		if (checkSimplex) {
			// 计算或者copy上次朝向采样的两个点（可能是计算的点，不一定在边界？）
			simpSolver.compute_points(pointOnA, pointOnB);
			// 由于采样方向是-AminB 所以是指向B，所以下面取反
			sepAxis.negate(normalInB);
			//normalInB.copy(sepAxis);
			let lenSqr = sepAxis.lengthSquared();
			if (lenSqr < 1e-12) {
				degenerateSimplex = 5;//dir无效
			} else {
				let len = Math.sqrt(lenSqr);
				let rlen = 1 / len;
				normalInB.scale(rlen, normalInB);	//规格化一下
				//let s = Math.sqrt(squaredDistance);	//TODO 是不是重复了
				// pointOnA.addScaledVector(margin, normalInB, pointOnA); 	TODO 谁加谁减
				// pointOnB.addScaledVector(-margin, normalInB, pointOnB);
				distance = len - margin;
				isValid = true;
			}
		}

		let catchDegeneratePenetrationCase = distance + margin < 1e-13
		if(!isValid || catchDegeneratePenetrationCase) {
			// 如果上面没有检测到，或者太深，GJK无法计算深度，只能用复杂的EPA解决
			if (this.penetrationDepthSolver) {
				let tmpPointOnA = new Vec3();
				let tmpPointOnB = new Vec3();
				sepAxis.set(0, 0, 0);
				let isValid2 = this.penetrationDepthSolver.calcPenDepth(this.simplexSolver, this.shapeA, this.shapeB, transA, transB, sepAxis, tmpPointOnA, tmpPointOnB);
				let sepLen = sepAxis.lengthSquared();
				if (sepLen > 0) {
					if (isValid2) {
						let tmpNormalInB = new Vec3();
						tmpPointOnB.vsub(tmpPointOnA, tmpNormalInB);
						let lenSqr = tmpNormalInB.lengthSquared();
						if (lenSqr <= PHYEPS2) {
							//==0
							tmpNormalInB.copy(sepAxis);
							lenSqr = sepLen;
						} else {
							//>0
							tmpNormalInB.scale(1 / Math.sqrt(lenSqr));//normalize
							let d = new Vec3();
							tmpPointOnA.vsub(tmpPointOnB, d);
							let l = -d.length();	// 深度是负的
							if (!isValid || l < distance) {
								// 深度取更深的。
								// 如果gjk没有检测到，或者epa检测的深度更大。
								//TODO add contact
								isValid = true;
							}
						}
					} else {
						//都这样了，EPA还是没有检测到碰撞的情况
					}
				}
			}
		}

		//if(isValid && (distance<0||distance*distance<maxDistSquared))
		if (isValid) { //&& distance < 0) { TODO distanc合理性检查
			// 确定碰撞了，处理碰撞
			sepAxis.normalize();
			sepAxis.negate(hitNorm);
			//hitNorm.copy(sepAxis);
			// 具体的碰撞点要把margin加上
			pointOnA.addScaledVector(this.shapeA.margin, sepAxis, hitA);// hitA = pointOnA - margin*norm
			hitA.vadd(cen,hitA);	//TODO 这个cen能去掉么，不知道有什么好处
			//hitA.copy(pointOnA);
			//hitB.copy(pointOnB);
			pointOnB.addScaledVector(this.shapeB.margin,hitNorm,hitB);	//hitB = pointOnB+margin*norm
			hitB.vadd(cen,hitB);
		}
		// 恢复transform
		// 先不做这个，直接用世界坐标
		//transA.position = oldTransB;
		//transB.position = oldTransB;
//DEBUG
return -1;
		//performance.mark('getcloseptend');
		//performance.measure('getClosePoint','getcloseptstart','getcloseptend');
		return -distance;
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
	computeSupport(transA: Transform, transB: Transform, dir: Vec3, worldA: Vec3, worldB: Vec3, aMinB: Vec3, noMargin: boolean) {
		let A = this.shapeA;
		let B = this.shapeB;
		//先把dir转换到本地空间
		let dirA = _computeSupport_Vec1;
		let dirB = _computeSupport_Vec2;
		let negDir = new Vec3();
		negDir.copy(dir).negate(negDir);
		// 把dir转换到本地空间		
		let qA = transA.quaternion;
		qA.w *= -1;
		qA.vmult(dir, dirA);
		qA.w *= -1;

		let qB = transB.quaternion;
		qB.w *= -1;
		qB.vmult(negDir, dirB);
		qB.w *= -1;

		let supA = _computeSupport_Vec3;
		let supB = _computeSupport_Vec4;
		if (noMargin) {
			A.getSupportVertexWithoutMargin(dirA, supA);
			B.getSupportVertexWithoutMargin(dirB, supB);
		} else {
			A.getSupportVertex(dirA, supA);
			B.getSupportVertex(dirB, supB);		//问题：例如盒子，得到的support会不会抖动，例如不转的时候，轴向采样的话四个点都可以
		}
		// 转换到世界空间
		transA.pointToWorld(supA, worldA);
		transB.pointToWorld(supB, worldB);
		worldA.vsub(worldB, aMinB);	//A-B 就是 B指向A
	}


	simplexAdd() {

	}
}