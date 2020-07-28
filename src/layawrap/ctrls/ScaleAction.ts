import { KeyInputAction, IAction, OperatorInfo } from "./KeyInputAction";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Camera } from "laya/d3/core/Camera";
import { Vector2 } from "laya/d3/math/Vector2";
import { Ray } from "laya/d3/math/Ray";
import { Vector3 } from "laya/d3/math/Vector3";
import { hitLine, hitPlane } from "./MouseCtrl";


export class ScaleAction extends KeyInputAction implements IAction{
	private static mousePt:Vector2;
	private static v1:Vector3;
	private static v2:Vector3;

	/** 鼠标刚按下的时候的位置 */
	private startPos:Vector3=new Vector3();
	private lastHitPos = new Vector3();	
	private curHitPos = new Vector3();
	private outScale = new Vector3();
	/** 恢复用的 */
	private startScale = new Vector3();	

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
		if(!ScaleAction.mousePt){
			ScaleAction.mousePt = new Vector2();
			ScaleAction.v1=new Vector3();
			ScaleAction.v2=new Vector3();
		}
	}
	constructor(){
		super();
		this.initStatic();
	}

	private updateRay(mousex:number,mousey:number){
		let ray = this.camRay;
		let mousept = ScaleAction.mousePt;
		mousept.setValue(mousex,mousey);
		this.camera.viewportPointToRay(mousept, ray);
	}

	/**
	 * 
	 * @param dx x方向的缩放
	 * @param dy 
	 * @param dz 
	 */
	__applyDelta(dx:number,dy:number,dz:number){
		if(!this.node)
			return;
		let s = this.node.transform.scale;
		s.x*=dx;
		s.y*=dy;
		s.z*=dz;
		this.node.transform.scale = s;
		s.cloneTo(this.outScale);
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
			hit =  hitPlane(this.camRay, this.rotAxis, this.planeD, hitpos );
		else 
			hitLine(this.camRay,this.startPos,this.rotAxis,hitpos);

		if(hit){
			let k = this.shift?0.1:1;
			let lp = this.lastHitPos;
			let dx = (hitpos.x-lp.x)*k/lp.x;
			let dy = (hitpos.y-lp.y)*k/lp.y;
			let dz = (hitpos.z-lp.z)*k/lp.z;
			this.__applyDelta(dx,dy,dz);

			this.curHitPos.cloneTo(this.lastHitPos );
		}
	}

	// 确认
	apply(outop:any){
		if(!this.node)
			return;
		//this.__apply(this.outScale);	已经应用过了？
		this.node=null;
		// 记录undo
		if(outop){
			if(!outop.applyop) outop.applyop={};
			if(!outop.lastop) outop.lastop={}
			let r = this.outScale;
			outop.applyop['scale']=[r.x,r.y,r.z];
			let ls = this.startScale;
			outop.lastop['scale']=[ls.x,ls.y,ls.z];
		}		
	}

	// 取消
	cancel(){
		if(!this.node)
			return;
		this.node.transform.localScale = this.startScale;
		this.node=null;
	}

	startAction(node:Sprite3D, cam:Camera, mousex:number,mousey:number){
		this.shift=false;
		super._startAction(node,cam);
		this.node=node;
		this.camera = cam;
		node.transform.position.cloneTo(this.startPos);
		this.startPos.cloneTo(this.outScale);

		node.transform.localScale.cloneTo(this.startScale);

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
		hitPlane(this.camRay, this.rotAxis, this.planeD, this.lastHitPos );
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
			hitPlane(this.camRay, this.rotAxis, this.planeD, this.lastHitPos );
		else 
			hitLine(this.camRay,this.startPos,this.rotAxis,this.lastHitPos);
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
		// 应用
		this.__applyDelta( ax.x*delta, ax.y*delta, ax.z*delta);
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