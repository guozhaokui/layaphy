import Transform from "../math/Transform";
import Vec3 from "../math/Vec3";
import Mat3 from "../math/Mat3";
import { GJK, GJK_eStatus } from "./GJK";
import { EPA, EPA_eStatus } from "./EPA";
import { MinkowskiShape } from "../shapes/MinkowskiShape";

const GJK_MIN_DISTANCE = 1e-12;

export class MinkowskiDiff {
	//shapes: MinkowskiShape[] = [];
	shapeA:MinkowskiShape;
	shapeB:MinkowskiShape;

	toshape1 = new Mat3();
	toshape0 = new Transform();

	constructor(shapeA:MinkowskiShape,shapeB:MinkowskiShape){
		this.reset(shapeA,shapeB);
	}

	reset(shapeA:MinkowskiShape,shapeB:MinkowskiShape){
		this.shapeA=shapeA;
		this.shapeB=shapeB;
		//this.toshape1 = wtrs1.getBasis().transposeTimes(wtrs0.getBasis());	TODO
		//this.toshape0 = wtrs0.inverseTimes(wtrs1);
	}

	//btVector3 (btConvexShape::*Ls)(btVector3&) const;
	EnableMargin(b: boolean) {

	}

	Support0(d: Vec3): Vec3 {
		//return (((m_shapes[0])->*(Ls))(d));
		throw '';
	}
	Support1(d: Vec3): Vec3 {
		//return (m_toshape0 * ((m_shapes[1])->*(Ls))(m_toshape1 * d));
		throw '';
	}
	Support(d: Vec3, idx: i32): Vec3 {
		if (idx)
			return this.Support1(d);
		else
			return this.Support0(d);
	}
	Support_(d: Vec3): Vec3 {
		//return this.Support0(d) - this.Support1(-d);
		throw '';
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

function Initialize( wtrs0: Transform,  wtrs1: Transform, results: sResults, shape: MinkowskiDiff) {
	results.witnessA.set(0, 0, 0);
	results.witnessB.set(0, 0, 0);
	results.status = Result_Status.Separated;
	//shape.toshape1 = wtrs1.getBasis().transposeTimes(wtrs0.getBasis());	TODO
	//shape.toshape0 = wtrs0.inverseTimes(wtrs1);
}

var negVec = new Vec3();
var tmpV1 = new Vec3();

export function Distance(shape0: MinkowskiShape, wtrs0: Transform, shape1: MinkowskiShape, wtrs1: Transform, guess: Vec3, results: sResults) {
	let shape = new MinkowskiDiff(shape0,shape1);
	shape.EnableMargin(false);
	Initialize(wtrs0, wtrs1, results, shape);
	let gjk = new GJK();
	let gjk_status = gjk.Evaluate(shape, guess);
	if (gjk_status == GJK_eStatus.Valid) {
		let w0 = new Vec3();
		let w1 = new Vec3();
		for (let i = 0; i < gjk.m_simplex.rank; ++i) {
			let p = gjk.m_simplex.p[i];
			let cd = gjk.m_simplex.c[i].d;
			let sup = shape.Support(cd, 0);
			w0.addScaledVector(p, sup, w0);	//w0 += shape.Support(cd, 0) * p;

			cd.negate(negVec);
			sup = shape.Support(negVec, 1);
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
	let shape = new MinkowskiDiff(shape0,shape1);
	shape.EnableMargin(usemargins);
	Initialize(wtrs0, wtrs1, results,shape);
	let gjk = new GJK();
	guess.negate(negVec);
	let gjk_status = gjk.Evaluate(shape, negVec);
	switch (gjk_status) {
		case GJK_eStatus.Inside:// GJK 判断发生了碰撞，下面开始用EPA计算距离
			{
				let epa = new EPA();
				let epa_status = epa.Evaluate(gjk, negVec);	// -guess
				if (epa_status != EPA_eStatus.Failed) {
					// EPA正常
					let w0 = new Vec3();
					for (let i = 0; i < epa.m_result.rank; ++i) {
						let sup = shape.Support(epa.m_result.c[i].d, 0);
						//w0 += shape.Support(epa.m_result.c[i] . d, 0) * epa.m_result.p[i];
						w0.addScaledVector(epa.m_result.p[i], sup, w0);
					}
					results.status = Result_Status.Penetrating;
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