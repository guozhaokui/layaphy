import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Ray } from "laya/d3/math/Ray";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { ArcBall } from "./ArcBall";
import { KeyInputAction, IAction, OperatorInfo } from "./KeyInputAction";

export class RotationAction extends KeyInputAction implements IAction{
	private static mousePt = new Vector2();
	private static v1=new Vector3();
	private static v2=new Vector3();

	private startRot:Quaternion=new Quaternion();
	// 起点要不断更新，否则幅度太大的时候会产生意外旋转
	private lastHitPos = new Vector3();	
	private curHitPos = new Vector3();
	private deltaRot = new Quaternion();
	private outRot = new Quaternion();

	rotAxis=new Vector3();	// 旋转轴：缺省是摄像机z轴，第一次切换为世界空间轴，第二次本地空间轴
	private rotOrig=new Vector3();	// 旋转原点
	private camDir=new Vector3();	// 摄像机朝向。作为缺省旋转轴。是摄像机朝向的反向
	private planeD=0;				// 构造的点击平面。 平面方程是: ax+by+cz=d
	private rayDir=new Vector3();	// 鼠标射线方向

	private camRay:Ray = new Ray(new Vector3(), new Vector3());
	private camera:Camera;

	private cax=0;		//0 x, 1 y 2 z
	private worldAx=0;	// 0 视平面， 世界空间， 本地空间

	// 操作的节点
	node:Sprite3D|null;

	constructor(){
		super();
	}

	private hitPlane(hitpos:Vector3):boolean{
		let r = this.camRay;
		let rdir = this.rayDir;
		Vector3.normalize(r.direction,rdir);

		// dot(raypos, norm)+dot(raydir,norm)*t=d;
		let t = this.planeD-Vector3.dot(r.origin, this.rotAxis)/Vector3.dot(rdir, this.rotAxis);
		if(t>=0 && t<1e8){
			r.origin.cloneTo(hitpos);
			hitpos.x+=rdir.x*t;
			hitpos.y+=rdir.y*t;
			hitpos.z+=rdir.z*t;
			return true;
		}
		return false;
	}

	private updateRay(){
		let ray = this.camRay;
		let mousept = RotationAction.mousePt;
		mousept.setValue(Laya.stage.mouseX, Laya.stage.mouseY);
		this.camera.viewportPointToRay(mousept, ray);
	}

	onMouseMove(mx:number, my:number){
		if(!this.node)
			return;

		if(this.useInput)
			return;

		this.updateRay();
		let hitpos = this.curHitPos;
		if(this.hitPlane(hitpos)){
			let v1=RotationAction.v1;
			let v2=RotationAction.v2;
	
			Vector3.subtract(this.lastHitPos, this.rotOrig, v1);
			Vector3.subtract(hitpos, this.rotOrig, v2);
			Vector3.normalize(v1,v1);
			Vector3.normalize(v2,v2);
			let deltaRot = this.deltaRot;
			ArcBall.rotationTo(deltaRot, v1,v2);
			Quaternion.multiply(deltaRot, this.outRot, this.outRot);

			// 应用
			let r = this.node.transform.rotation;
			this.outRot.cloneTo(r);
			this.node.transform.rotation = r;

			this.curHitPos.cloneTo(this.lastHitPos );
		}
	}

	// 确认
	apply(outop:OperatorInfo){
		if(!this.node)
			return;
		let r = this.node.transform.rotation;
		this.outRot.cloneTo(r);
		this.node.transform.rotation = r;
		this.node=null;

		// 记录undo
		if(outop){
			if(!outop.applyop) outop.applyop={};
			if(!outop.lastop) outop.lastop={}
			outop.applyop['rotation']=[r.x,r.y,r.z,r.w];
			let lr = this.startRot;
			outop.lastop['rotation']=[lr.x,lr.y,lr.z,lr.w];
		}
	}

	// 取消
	cancel(){
		if(!this.node)
			return;
		let r = this.node.transform.rotation;
		this.startRot.cloneTo(r);
		this.node.transform.rotation = r;
		this.node=null;
	}

	startAction(node:Sprite3D, cam:Camera){
		super.startAction(node,cam);
		this.node=node;
		this.camera = cam;
		node.transform.rotation.cloneTo(this.startRot);
		node.transform.position.cloneTo(this.rotOrig);
		this.startRot.cloneTo(this.outRot);

        // 开始的时候，修正一个合理的dist，避免target在空中，dist很小了以后移动很慢的问题
        var mat = cam.transform.worldMatrix.elements;
        var zx = mat[8];		// z轴朝向
        var zy = mat[9];
        var zz = mat[10];
		this.camDir.setValue(zx,zy,zz);	//TODO 是否要取反
		Vector3.normalize(this.camDir, this.camDir);

		this.updateRay();

		this.cax=0;
		this.worldAx=0;

		this.useInput=false;
		this.onChangeAxis();

		//this.lastQuat.identity();

		// 计算初始拾取点
		this.hitPlane(this.lastHitPos);
		//let cx = Laya.stage.mouseX;
		//let cy = Laya.stage.mouseY;
		//this.arcball.startDrag(cx,cy, cam.transform.worldMatrix);
	}

	/**
	 * 设置转轴（平面法线），计算平面d
	 */
	private onChangeAxis(){
		if(!this.node)
			return;
		switch(this.worldAx){
			case 0:
				this.camDir.cloneTo(this.rotAxis);
				break;
			case 1:	// 世界空间
				if(this.cax==0) this.rotAxis.setValue(1,0,0);
				else if(this.cax==1) this.rotAxis.setValue(0,1,0);
				else this.rotAxis.setValue(0,0,1);

				break;
			case 2:	// 本地空间
			{
				let worldmate =  this.node.transform.worldMatrix.elements;
				if(this.cax==0){
					this.rotAxis.setValue(worldmate[0], worldmate[1], worldmate[2]);
				}else if(this.cax==1){
					this.rotAxis.setValue(worldmate[4], worldmate[5], worldmate[6]);
				}else{
					this.rotAxis.setValue(worldmate[8], worldmate[9], worldmate[10]);
				}
				Vector3.normalize(this.rotAxis,this.rotAxis);
			}
				break;
		}

		console.log('rotax=',this.rotAxis);
		this.planeD = Vector3.dot(this.rotAxis,this.rotOrig);
		this.hitPlane(this.lastHitPos);
	}

	protected onInputValueChanged(deg:number){
		if(!this.node)
			return;
		Quaternion.createFromAxisAngle(this.rotAxis,deg*Math.PI/180,this.deltaRot);
		Quaternion.multiply(this.deltaRot, this.startRot, this.outRot);

		// 应用
		let r = this.node.transform.rotation;
		this.outRot.cloneTo(r);
		this.node.transform.rotation = r;
	}

	// 如果上层没有截获，则这里处理
	onKeyEvent(keycode:int,down:boolean){
		if(!this.node)
			return;
		super.onKeyEvent(keycode,down);

		let cax = this.cax;
		if(keycode>=88&&keycode<=90){	// xyz
			let ax = keycode-88;
			if(cax!=ax){
				this.cax=ax;
				this.worldAx=1;
				this.onChangeAxis();
			}else{
				this.worldAx+=1;
				this.worldAx%=3;
				this.onChangeAxis();
			}
		}
	}
}