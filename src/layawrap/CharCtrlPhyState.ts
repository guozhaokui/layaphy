import { Body } from "../objects/Body";

export const enum PhyState {
	GROUND = 0,
	JUMPUP = 1,
	FALLING = 3,
	MAYBEGROUND=4,
}

var stateName:string[]=[];
stateName[PhyState.GROUND]='地面';
stateName[PhyState.JUMPUP]='跳-上升';
stateName[PhyState.FALLING]='下落中';
stateName[PhyState.MAYBEGROUND]='疑似地面';	// 下落中遇到碰撞就开始进入，速度稳定到0左右就是地面

export const enum PhyEvent {
	COLLIDE = 2,	// 发生碰撞
	JUMP = 3,		// 起跳
	TICK = 5,		// 时间相关
}

export const enum PhyOutEvent{
	FALLSTART=0,
	FALLSTOP=1,
}

const _internalEvt_STARTFALL=101;	// 开始下落

interface ISprite {
	phyStateEvent(evt: PhyOutEvent):void;
	getGroundDist(maxdist:number):number;
}

var FALLDIST=2;
/**
 * 维护一个物理状态
 */
export class CharCtrlPhyState {
	private phyBody: Body;
	private owner: ISprite;
	private stateStartTm = 0;
	private state = PhyState.GROUND;
	private lastx=0;
	private lastz=0;
	private _isFalling=false;

	constructor(body: Body, owner: ISprite) {
		this.phyBody = body;
		this.owner = owner;
	}

	isOnGround(){
		return this.state==PhyState.GROUND;
	}

	/**
	 * 距离地面多高能感觉到，会引起状态变换
	 * @param v 
	 */
	setFallDist(v:number){
		FALLDIST = v;
	}

	/**
	 * 每帧调用，自动检测速度
	 */
	tick(){
		// 速度相关
		let vel = this.phyBody.velocity;
		let pos = this.phyBody.position;
		let dx = pos.x-this.lastx;
		let dy = pos.z-this.lastz;
		let moved=false;
		if(dx*dx+dy*dy>0.1){
			moved=true;
			this.lastx=pos.x;
			this.lastz=pos.z;
		}
		if(moved){
			//evt 检测到移动
		}

		if(vel.y<-0.01){// 由于检测地面高度比较费，所以优先用下落做筛选
			// 注意：角色在地面状态的时候不要消掉y的负速度，否则这里检测不到下落了
			//evt 检测到速度朝下了
			if(!this._isFalling){
				this.handlePhyState(_internalEvt_STARTFALL);
				this._isFalling=true;
			}
		}else{
			this._isFalling=false;
		}

		this.handlePhyState(PhyEvent.TICK);
	}

	/**
	 * 发送事件引起内部状态变化。并可能触发owner的事件
	 * @param evt 
	 */
	handlePhyState(evt: PhyEvent|int) {
		let vel = this.phyBody.velocity;

		if(evt==PhyEvent.TICK){
			//let stateTm = Date.now()-this.stateStartTm;
		}

		//let YSPEEDZERO=false;
		// 预处理碰撞信息，判断是不是地面
		if(evt==PhyEvent.COLLIDE){
			//if(Math.abs(vel.y)<0.01){  碰撞后速度可能依然很大
				// 可能碰撞到地面了，也可能在地面撞墙
			//	YSPEEDZERO=true;
			//}
		}

		switch(this.state){
			case PhyState.GROUND:{
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case _internalEvt_STARTFALL:
						if(this.owner.getGroundDist(100)>FALLDIST){
							this._toState(PhyState.FALLING);
						}
						break;
				}
			}
			break;
			case PhyState.JUMPUP:
				// 起跳阶段不检查是否落地
				switch(evt){
					case _internalEvt_STARTFALL:
						if(this.owner.getGroundDist(100)>FALLDIST){
							this._toState(PhyState.FALLING);
						}else{
							this._toState(PhyState.GROUND);
						}
						break;
					case PhyEvent.COLLIDE:
						//this.toState(physta)
						break;
				}
				break;
			case PhyState.FALLING:
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case PhyEvent.COLLIDE:
						this._toState(PhyState.GROUND);// 直接转到地面，再判断是否下落
						break;
				}
				break;
			/*
			case PhyState.MAYBEGROUND:
				if(Math.abs(vel.y)<0.001){
					this._toState(PhyState.GROUND);
					break;
				}
				break;
			*/
		}
	}

	/**
	 * 内部状态转移。会发出新的事件给控制对象
	 * @param s 
	 */
	private _toState(s: PhyState) {
		let owner = this.owner;
		this.stateStartTm = Date.now();
		let last = this.state;
		switch (s) {
			case PhyState.GROUND:
				if (last == PhyState.FALLING){
					owner.phyStateEvent(PhyOutEvent.FALLSTOP);
				}
				break;
			case PhyState.FALLING:
				owner.phyStateEvent(PhyOutEvent.FALLSTART);
				break;
			default:
				break;
		}
		this.state=s;
		console.log('toState:',stateName[s]);
	}
}