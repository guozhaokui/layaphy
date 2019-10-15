import {Transform} from "../math/Transform";
import {Vec3} from "../math/Vec3";
import { MinkowskiShape } from "../shapes/MinkowskiShape";
import { EPA, EPA_eStatus } from "./EPA";
import { GJK, GJK_eStatus } from "./GJK";

const GJK_MIN_DISTANCE = 1e-12;

let sup1 = new Vec3();
let sup2 = new Vec3();
let sup_negd=new Vec3();

let sup_dir1=new Vec3();
let sup_dir2=new Vec3();

let tmpVec=new Vec3();	//保证在局部范围用的
let worldA=new Vec3();
let worldB=new Vec3();

export class MinkowskiDiff {
	shapeA:MinkowskiShape;
	shapeB:MinkowskiShape;

	//toshape1 = new Mat3();			// 用来把采样方向转到shape1本地空间
	//toshape0 = new Transform();		// 用来把一个点转
	transA:Transform;
	transB:Transform;

	constructor(){
	}

	reset(shapeA:MinkowskiShape,shapeB:MinkowskiShape, transA:Transform, transB:Transform){
		this.shapeA=shapeA;
		this.shapeB=shapeB;
		this.transA=transA;
		this.transB=transB;
		return this;
		//this.toshape1 = wtrs1.getBasis().transposeTimes(wtrs0.getBasis());	TODO
		//this.toshape0 = wtrs0.inverseTimes(wtrs1);
	}

	//btVector3 (btConvexShape::*Ls)(btVector3&) const;
	EnableMargin(b: boolean) {
	}

	/**
	 * 沿着d方向采样shapeA
	 * @param d A的本地空间
	 */
	Support0(d: Vec3,out=new Vec3()): Vec3 {
		this.shapeA.getSupportVertex(d,out);
		return out;
	}

	/**
	 * 沿着d方向采样shapeB
	 * @param d 
	 */
	Support1(d: Vec3,out=new Vec3()): Vec3 {
		//return (m_toshape0 * ((m_shapes[1])->*(Ls))(m_toshape1 * d));
		throw '';
	}

	/**
	 * 沿着d方向采样
	 * @param d 
	 * @TODO 空间转换部分要优化
	 */
	Support(d: Vec3,noMargin:boolean,out=new Vec3()): Vec3 {
		/*
		this.Support0(d,sup1);
		d.negate(sup_negd);
		this.Support1(sup_negd,sup2);
		sup1.vsub(sup2,out);
		return out;
		*/
		let transA=this.transA;
		let transB=this.transB;
		let A = this.shapeA;
		let B = this.shapeB;
		//先把dir转换到本地空间
		let dirA = sup_dir1;
		let dirB = sup_dir2;
		let negDir = new Vec3();
		negDir.copy(d).negate(negDir);
		// 把dir转换到本地空间		
		let qA = transA.quaternion;
		qA.w *= -1;
		qA.vmult(d, dirA);
		qA.w *= -1;

		let qB = transB.quaternion;
		qB.w *= -1;
		qB.vmult(negDir, dirB);
		qB.w *= -1;

		let supA = sup1;
		let supB = sup2;
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
		worldA.vsub(worldB, out);	//A-B 就是 B指向A		
		return out;
	}
}

export enum Result_Status {
	Separated,   /* Shapes doesnt penetrate												*/
	Penetrating, /* Shapes are penetrating												*/
	GJK_Failed,  /* GJK phase fail, no big issue, shapes are probably just 'touching'	*/
	EPA_Failed   /* EPA phase fail, bigger problem, need to save parameters, and debug	*/
}

export class sResults {
	status: Result_Status;
	witnessA=new Vec3();		//A上的碰撞点
	witnessB=new Vec3();		//B上的碰撞点
	normal = new Vec3();		//碰撞法线
	distance = 0;
	reset(){
		this.witnessA.set(0, 0, 0);
		this.witnessB.set(0, 0, 0);
		this.status = Result_Status.Separated;
	}
};

var negVec = new Vec3();
var tmpV1 = new Vec3();

export function Distance(shape0: MinkowskiShape, wtrs0: Transform, shape1: MinkowskiShape, wtrs1: Transform, guess: Vec3, results: sResults) {
	let shape = new MinkowskiDiff();
	shape.reset(shape0,shape1,wtrs0,wtrs1).EnableMargin(false);
	results.reset();
	let gjk = new GJK();
	let gjk_status = gjk.Evaluate(shape, guess);
	if (gjk_status == GJK_eStatus.Valid) {
		let w0 = new Vec3();
		let w1 = new Vec3();
		for (let i = 0; i < gjk.m_simplex.rank; ++i) {
			let p = gjk.m_simplex.p[i];
			let cd = gjk.m_simplex.supv[i].d;
			let sup = shape.Support0(cd);
			w0.addScaledVector(p, sup, w0);	//w0 += shape.Support(cd, 0) * p;

			cd.negate(negVec);
			sup = shape.Support1(negVec);
			w1.addScaledVector(p, sup, w1);	//w1 += shape.Support(-cd, 1) * p;
		}
		//results.witnesses[0] = wtrs0 * w0;
		wtrs0.pointToWorld(w0, results.witnessA);
		//results.witnesses[1] = wtrs0 * w1;
		wtrs0.pointToWorld(w1, results.witnessB);
		w0.vsub(w1, results.normal); //results.normal = w0 - w1;
		results.distance = results.normal.length();
		let s = results.distance > GJK_MIN_DISTANCE ? results.distance : 1;
		results.normal.scale(1 / s, results.normal);
		return true;
	} else {
		results.status = gjk_status == GJK_eStatus.Inside ? Result_Status.Penetrating : Result_Status.GJK_Failed;
		return false;
	}
}

let minkShape = new MinkowskiDiff();
/**
 * 计算shape0和shape1之间的碰撞深度。
 * @param shape0 
 * @param wtrs0 	转换到实际空间的transfrom
 * @param shape1 
 * @param wtrs1 
 * @param guess 
 * @param results 	输出结果
 * @param usemargins  是否使用shape的margin
 * @return false 没有检测到碰撞
 */
export function Penetration(shape0: MinkowskiShape, wtrs0: Transform, shape1: MinkowskiShape, wtrs1: Transform, guess: Vec3, results: sResults, usemargins: boolean = true) {
	let shape = minkShape;
	shape.reset(shape0,shape1,wtrs0,wtrs1).EnableMargin(usemargins);
	results.reset();
	let gjk = new GJK();
	let gjk_status = gjk.Evaluate(shape, guess.negate(negVec));
	switch (gjk_status) {
		case GJK_eStatus.Inside:// GJK 判断发生了碰撞，下面开始用EPA计算距离
			{
				let epa = new EPA();
				let epa_status = epa.Evaluate(gjk, negVec);	// -guess
				if (epa_status != EPA_eStatus.Failed) {
					// EPA正常
					let w0 = new Vec3();
					//根据重心坐标计算出最近的点
					for (let i = 0; i < epa.m_result.rank; ++i) {
						let sup = shape.Support0(epa.m_result.supv[i].d);	// 根据结果中保存的朝向采样shape0
						//w0 += shape.Support(epa.m_result.c[i] . d, 0) * epa.m_result.p[i];
						w0.addScaledVector(epa.m_result.p[i], sup, w0);
					}
					results.status = Result_Status.Penetrating;
					// 把结果转换到世界空间
					//results.witnesses[0] = wtrs0 * w0;
					wtrs0.pointToWorld(w0, results.witnessA)
					w0.addScaledVector(-epa.m_depth, epa.m_normal, tmpV1);//tmpV1 = (w0 - epa.m_normal * epa.m_depth)
					//results.witnesses[1] = wtrs0 * tmpV1;
					wtrs0.pointToWorld(tmpV1, results.witnessB);
					epa.m_normal.negate(results.normal); //results.normal = -epa.m_normal;
					results.distance = -epa.m_depth;
					return true;
				}
				else
					results.status = Result_Status.EPA_Failed;
			}
			break;
		case GJK_eStatus.Failed:
			results.status = Result_Status.GJK_Failed;
			break;
		default:
			break;
	}
	return false;
}