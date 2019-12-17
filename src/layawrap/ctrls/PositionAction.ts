import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Ray } from "laya/d3/math/Ray";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { IAction, KeyInputAction } from "./KeyInputAction";

export class PositionAction extends KeyInputAction implements IAction{
	private static mousePt:Vector2;
	private static v1:Vector3;
	private static v2:Vector3;

	private startPos:Vector3=new Vector3();
	private lastHitPos = new Vector3();	
	private curHitPos = new Vector3();
	private outPos = new Vector3();

	rotAxis=new Vector3();	// 旋转轴：缺省是摄像机z轴，第一次切换为世界空间轴，第二次本地空间轴
	private camDir=new Vector3();	// 摄像机朝向。作为缺省旋转轴。是摄像机朝向的反向
	private planeD=0;				// 构造的点击平面。 平面方程是: ax+by+cz=d
	private rayDir=new Vector3();	// 鼠标射线方向

	private camRay:Ray = new Ray(new Vector3(), new Vector3());
	private camera:Camera;

	private cax=0;		//0 x, 1 y 2 z
	private worldAx=0;	// 0 视平面， 世界空间， 本地空间

	private movOnPlane=true;	// true则在平面移动。否则在轴上移动。在轴上移动的话，用直线交点
	
	// 操作的节点
	node:Sprite3D|null;

	initStatic(){
		if(!PositionAction.mousePt){
			PositionAction.mousePt = new Vector2();
			PositionAction.v1=new Vector3();
			PositionAction.v2=new Vector3();
		}
	}
	constructor(){
		super();
		this.initStatic();
	}

	private hitPlane(hitpos:Vector3):boolean{
		let r = this.camRay;
		let rdir = this.rayDir;
		Vector3.normalize(r.direction,rdir);

		// dot(raypos, norm)+dot(raydir,norm)*t=d;
		let t = (this.planeD-Vector3.dot(r.origin, this.rotAxis))/Vector3.dot(rdir, this.rotAxis);
		if(t>=0 && t<1e8){
			r.origin.cloneTo(hitpos);
			hitpos.x+=rdir.x*t;
			hitpos.y+=rdir.y*t;
			hitpos.z+=rdir.z*t;
			return true;
		}
		return false;
	}

	/**
	 * 射线与移动轴的碰撞检测，取最近距离对应的点作为碰撞点。
	 * @param hitpos 
	 */
	private hitLine(hitpos:Vector3){
		let r = this.camRay;
		let rdir = this.rayDir;
		Vector3.normalize(r.direction,rdir);

		let P1 = this.startPos;
		let D1 = this.rotAxis;

		let P2 = r.origin;
		let D2 = rdir;

		console.log('--',D1)

		let d = PositionAction.v1;
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
			console.log('t=',t1,t2);
			hitpos.setValue(
				P1.x+t1*D1.x,
				P1.y+t1*D1.y,
				P1.z+t1*D1.z
				);

		}
	}

	private updateRay(mousex:number,mousey:number){
		let ray = this.camRay;
		let mousept = PositionAction.mousePt;
		mousept.setValue(mousex,mousey);
		this.camera.viewportPointToRay(mousept, ray);
	}

	__apply(pos:Vector3){
		if(!this.node)
			return;
		let r = this.node.transform.position;
		pos.cloneTo(r);
		this.node.transform.position = r;
	}

	onMouseMove(mx:number, my:number){
		if(!this.node)
			return;

		if(this.useInput)
			return;

		this.updateRay(mx,my);
		let hitpos = this.curHitPos;
		let hit=true;
		if(this.movOnPlane)
			hit = this.hitPlane(hitpos);
		else 
			this.hitLine(hitpos);

		if(hit){
			let k = this.shift?0.1:1;
			let lp = this.lastHitPos;
			this.outPos.x += (hitpos.x-lp.x)*k;
			this.outPos.y += (hitpos.y-lp.y)*k;
			this.outPos.z += (hitpos.z-lp.z)*k;
	
			// 应用
			this.__apply(this.outPos);

			this.curHitPos.cloneTo(this.lastHitPos );
		}
	}

	// 确认
	apply(outop:any){
		if(!this.node)
			return;
		this.__apply(this.outPos);
		this.node=null;
		// 记录undo
		if(outop){
			if(!outop.applyop) outop.applyop={};
			if(!outop.lastop) outop.lastop={}
			let r = this.outPos;
			outop.applyop['position']=[r.x,r.y,r.z];
			let lr = this.startPos;
			outop.lastop['position']=[lr.x,lr.y,lr.z];
		}		
	}

	// 取消
	cancel(){
		if(!this.node)
			return;
		this.__apply(this.startPos);
		this.node=null;
	}

	startAction(node:Sprite3D, cam:Camera, mousex:number,mousey:number){
		super._startAction(node,cam);
		this.node=node;
		this.camera = cam;
		node.transform.position.cloneTo(this.startPos);
		this.startPos.cloneTo(this.outPos);

        // 开始的时候，修正一个合理的dist，避免target在空中，dist很小了以后移动很慢的问题
        var mat = cam.transform.worldMatrix.elements;
        var zx = mat[8];		// z轴朝向
        var zy = mat[9];
        var zz = mat[10];
		this.camDir.setValue(zx,zy,zz);	//TODO 是否要取反
		Vector3.normalize(this.camDir, this.camDir);

		this.updateRay(mousex,mousey);

		this.cax=0;
		this.worldAx=0;

		this.useInput=false;
		this.onChangeAxis();

		// 计算初始拾取点
		this.hitPlane(this.lastHitPos);
	}

	/**
	 * 设置转轴（平面法线），计算平面d
	 */
	private onChangeAxis(){
		if(!this.node)
			return;
		switch(this.worldAx){
			case 0:
				this.movOnPlane=true;		// 没有指定轴，则平面移动
				this.camDir.cloneTo(this.rotAxis);
				break;
			case 1:	// 世界空间
				this.movOnPlane=false;		// 否则只在轴上移动
				if(this.cax==0) this.rotAxis.setValue(1,0,0);
				else if(this.cax==1) this.rotAxis.setValue(0,1,0);
				else this.rotAxis.setValue(0,0,1);

				break;
			case 2:	// 本地空间
			{
				this.movOnPlane=false;		// 否则只在轴上移动
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

		this.planeD = Vector3.dot(this.rotAxis,this.startPos);
		if(this.movOnPlane)
			this.hitPlane(this.lastHitPos);
		else this.hitLine(this.lastHitPos);
	}

	protected onInputValueChanged(delta:number){
		if(!this.node)
			return;
		console.log('value=',delta);
		let ax = this.rotAxis;
		if(this.worldAx==0){
			// 输入值的情况，摄像机方向按照x轴算
			ax.setValue(1,0,0);
		}

		let st=this.startPos;
		this.outPos.setValue( 
			st.x+ax.x*delta,
			st.y+ax.y*delta,
			st.z+ax.z*delta);

		// 应用
		this.__apply(this.outPos);
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