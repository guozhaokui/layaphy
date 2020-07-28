import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Ray } from "laya/d3/math/Ray";
import { Camera } from "laya/d3/core/Camera";

const enum TARGETTYPE{
	PLANE=0,	// 得到一个pos偏移
	LINE=1,		// 得到一个pos偏移
	PLANEROT=2,	// 指定平面上的一个点和法线，鼠标拖动绕着这个点，以法线为轴，转动这个平面，得到一个旋转delta
	ARCBALL=3,
}
var v1 = new Vector3();
var v2 = new Vector3();
var rayDir=new Vector3();	// 鼠标射线方向

/**
 * 射线与移动轴的碰撞检测，取最近距离对应的点作为碰撞点。
 * 一定有最近点，所以不用返回值
 * @param camray
 * @param linestart 线段的起点
 * @param linedir 线段的朝向
 * @param hitpos 
 */
export function hitLine(camray:Ray, linestart:Vector3, linedir:Vector3, hitpos:Vector3){
	let r = camray;
	let rdir = rayDir;
	let start = linestart;
	let dir = linedir;
	Vector3.normalize(r.direction,rdir);

	let P1 = start;
	let D1 = dir

	let P2 = r.origin;
	let D2 = rdir;

	let d = v1;
	Vector3.subtract(P1,P2,d);

	// 两个线段之间的距离: | P1+t1D1 -(P2+t2D2) |
	// P1-P2 = d
	// (d + t1D1-t2D2)^2 是距离的平方，对这个取全微分
	// 2(d+t1D1-t2D2)*D1, -2(d+t1D1-t2D2)*D2 这两个都是0
	// 显然这时候与D1,D2都垂直
	// -dD1 -t1D1^2 + t2D1D2  = 0
	// -dD2 -t1D1D2 + t2D2^2  = 0
	// 先用多项式的方法求解 Ax=b
	// | -D1^2  D1D2 | |t1|    |dD1|
	// |             | |  |  = |   |
	// | -D1D2  D2^2 | |t2|    |dD2|
	//
	// 如果平行，则有个方向的d永远为0
	let A = -Vector3.dot(D1, D1); let B =  Vector3.dot(D1, D2);
	let C = -B; let D = Vector3.dot(D2,D2);
	let b1 = Vector3.dot(d,D1);
	let b2 = Vector3.dot(d,D2);
	let adbc = A * D - B * C;
	if (adbc > -1e-6 && adbc < 1e-6) {
		//平行。这时候假设重合了，计算两条线的距离
		// TODO
		hitpos.setValue(P1.x,P1.y,P1.z);
	}else{
		let dd = 1 / adbc; 
		let t1 = (D * b1 - B * b2) * dd;	// 轴
		let t2 = (-C * b1 + A * b2) * dd;	// 射线
		hitpos.setValue(
			P1.x+t1*D1.x,
			P1.y+t1*D1.y,
			P1.z+t1*D1.z
			);
	}
}

export function hitPlane(camray:Ray, planeDir:Vector3, d:number, hitpos:Vector3){
	let r = camray;
	let rdir = rayDir;
	let norm = planeDir;
	Vector3.normalize(r.direction,rdir);

	// dot(raypos, norm)+dot(raydir,norm)*t=d;
	let t = (d-Vector3.dot(r.origin, norm))/Vector3.dot(rdir, norm);
	if(t>=0 && t<1e8){
		r.origin.cloneTo(hitpos);
		hitpos.x+=rdir.x*t;
		hitpos.y+=rdir.y*t;
		hitpos.z+=rdir.z*t;
		return true;
	}
	return false;
}

// class NCameraRay{
// 	// 
// 	private camera:Camera;
// 	private camRay:Ray = new Ray(new Vector3(), new Vector3());
// 	private static mousePt:Vector2;
// 	constructor(){
// 	}

// 	init(cam:Camera){
// 		this.camera = cam;
// 	}

// 	// 输入x,y输出ray
// 	getRay(mx:number,my:number){
// 		let ray = this.camRay;
// 		let mousept = NCameraRay.mousePt;
// 		mousept.setValue(mx,my);
// 		this.camera.viewportPointToRay(mousept, ray);
// 		return ray;
// 	}
// }

// class NRayDragLine{
// 	private start:Vector3=new Vector3();
// 	private dir:Vector3 = new Vector3();
// 	private lastHitPos = new Vector3();	
// 	private curHitPos = new Vector3();

// 	constructor(){
// 	}

// 	init(pos:Vector3, dir:Vector3){
// 		pos.cloneTo(this.start);
// 		dir.cloneTo(this.dir);
// 	}

// 	/**
// 	 *  out 1 
// 	 *  delta pos
// 	 */
// 	getDeltaPos(ray:Ray){

// 	}
// }

// class NRayDragPlane{
// 	constructor(){

// 	}
// }

// class NRayRotPlane{
// 	constructor(){

// 	}
// }

// class NRayRotArcball{
// 	constructor(){

// 	}
// }

// class NMouseCtrlGraph{
// 	camrayNode = new NCameraRay();
// 	rayDragLine = new NRayDragLine();
// 	mx=0;
// 	my=0;

// 	constructor(){

// 	}

// 	init( cam:Camera){
// 		this.camrayNode.init(cam);
// 	}

// 	setLine(){}
// 	setPlane(){}

// 	noderun(mx:number, my:number,finely:boolean, type:int){
// 		let ray = this.camrayNode.getRay(mx,my);
// 		let deltapos = this.rayDragLine.getDeltaPos(ray);
// 	}


// }

// export class MouseCtrl{
// 	private static mousePt:Vector2;
// 	private static v1:Vector3;
// 	private static v2:Vector3;
// 	private camRay:Ray = new Ray(new Vector3(), new Vector3());
// 	private camera:Camera;
// 	private rayDir=new Vector3();	// 鼠标射线方向

// 	private startPos:Vector3=new Vector3();
// 	private lastHitPos = new Vector3();	
// 	private curHitPos = new Vector3();

// 	// 拾取对象信息
// 	private targetType=TARGETTYPE.PLANE;	// 0:plane, 1:line
// 	private planeD=0;
// 	private planeDir=new Vector3();	// 面法线和线方向
// 	private lineStart=new Vector3();	// 线的起点或者面的点

// 	/**
// 	 * 根据屏幕位置更新this.camRay
// 	 * @param mousex 
// 	 * @param mousey 
// 	 */
// 	updateRay(mousex:number,mousey:number){
// 		let ray = this.camRay;
// 		let mousept = MouseCtrl.mousePt;
// 		mousept.setValue(mousex,mousey);
// 		this.camera.viewportPointToRay(mousept, ray);
// 	}			

// 	setTargetPlane(){

// 	}

// 	setTargetLine(){

// 	}

// 	start(){
// 		// 计算初始拾取点
// 		this.hitPlane(this.lastHitPos);
// 	}

// 	onMouseMove(mx:number, my:number, finely:boolean=false){
// 		this.updateRay(mx,my);
// 		let hitpos = this.curHitPos;
// 		let hit=true;
// 		if(this.targetType == TARGETTYPE.PLANE)
// 			hit = this.hitPlane(hitpos);
// 		else 
// 			this.hitLine(hitpos);

// 		if(hit){
// 			let k = finely?0.1:1;
// 			let lp = this.lastHitPos;
// 			this.outPos.x += (hitpos.x-lp.x)*k;
// 			this.outPos.y += (hitpos.y-lp.y)*k;
// 			this.outPos.z += (hitpos.z-lp.z)*k;
	
// 			// 应用
// 			this.__apply(this.outPos);

// 			this.curHitPos.cloneTo(this.lastHitPos );
// 		}
// 	}

// 	private getDeltaQuat(){
// 		let hitpos = this.curHitPos;
// 		let rotOrig = this.lineStart;

// 		if(this.hitPlane(hitpos)){
// 			let v1=MouseCtrl.v1;
// 			let v2=MouseCtrl.v2;
	
// 			Vector3.subtract(this.lastHitPos, rotOrig, v1);
// 			Vector3.subtract(hitpos, rotOrig, v2);
// 			Vector3.normalize(v1,v1);
// 			Vector3.normalize(v2,v2);
// 			let deltaRot = this.deltaRot;
// 			ArcBall.rotationTo(deltaRot, v1,v2);
// 			//
// 			if(this.shift){
// 				//deltaRot/10
// 				Quaternion.slerp( this.QuatI, deltaRot, 0.1, deltaRot);
// 			}
// 			Quaternion.multiply(deltaRot, this.outRot, this.outRot);

// 			// 应用
// 			let r = this.node.transform.rotation;
// 			this.outRot.cloneTo(r);
// 			this.node.transform.rotation = r;

// 			this.curHitPos.cloneTo(this.lastHitPos );
// 		}

// 	}

// 	hitPlane(hitpos:Vector3){
// 		let r = this.camRay;
// 		let rdir = this.rayDir;
// 		let norm = this.planeDir;
// 		let d = this.planeD;
// 		Vector3.normalize(r.direction,rdir);

// 		// dot(raypos, norm)+dot(raydir,norm)*t=d;
// 		let t = (d-Vector3.dot(r.origin, norm))/Vector3.dot(rdir, norm);
// 		if(t>=0 && t<1e8){
// 			r.origin.cloneTo(hitpos);
// 			hitpos.x+=rdir.x*t;
// 			hitpos.y+=rdir.y*t;
// 			hitpos.z+=rdir.z*t;
// 			return true;
// 		}
// 		return false;
// 	}
// }