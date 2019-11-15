import { Body } from "../objects/Body";

export const enum PhyState {
	GROUND = 0,
	JUMPUP = 1,
	FALL = 2,
	FALLING = 3,
}

var stateName:string[]=[];
stateName[PhyState.GROUND]='地面';
stateName[PhyState.JUMPUP]='跳-上升';
stateName[PhyState.FALL]='可能要下落';
stateName[PhyState.FALLING]='下落中';

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
const _internalEvt_HITGROUND=104;	// 碰到地面

interface ISprite {
	phyStateEvent(evt: PhyOutEvent):void;
	getGroundDist():number;
}

const FALLDIST=2;
/**
 * 维护一个物理状态
 */
export class CharCtrlPhyState {
	private lastSpeedY = 0; 	// 记录上次速度
	private phyBody: Body;
	private owner: ISprite;
	private stateStartTm = 0;
	private state = PhyState.GROUND;

	constructor(body: Body, owner: ISprite) {
		this.phyBody = body;
		this.owner = owner;
	}

	isOnGround(){
		return this.state==PhyState.GROUND;
	}

	/**
	 * 每帧调用，自动检测速度
	 */
	tick(){
		let vel = this.phyBody.velocity;
		if (this.lastSpeedY > 0 && vel.y <= 0) {
			//TODO 这个其实不用每帧调用
			// 射线检测一下距离
			
			this.handlePhyState(_internalEvt_STARTFALL);
		}
		if (this.lastSpeedY < 0 && vel.y >= 0) {
			this.handlePhyState(_internalEvt_HITGROUND);
		}
		this.lastSpeedY = vel.y;
		this.handlePhyState(PhyEvent.TICK);
	}

	/**
	 * 发送事件引起内部状态变化。并可能触发owner的事件
	 * @param evt 
	 */
	handlePhyState(evt: PhyEvent|int) {
		let stateTm = 0;
		if(evt==PhyEvent.TICK){
			stateTm = Date.now()-this.stateStartTm;
		}

		switch(this.state){
			case PhyState.GROUND:{
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case _internalEvt_STARTFALL:
						this._toState(PhyState.FALL);
						break;
				}
			}
			break;
			case PhyState.JUMPUP:
				switch(evt){
					case _internalEvt_STARTFALL:
						this._toState(PhyState.FALL);
						break;
					case PhyEvent.COLLIDE:
						//this.toState(physta)
						break;
					case _internalEvt_HITGROUND:
						this._toState(PhyState.GROUND);
						break;
				}
				break;
			case PhyState.FALL:{
				if(this.owner.getGroundDist()>FALLDIST){
					this._toState(PhyState.FALLING);
				}
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case _internalEvt_HITGROUND:
						this._toState(PhyState.GROUND);
						break;
				}
			}
			break;
			case PhyState.FALLING:
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case _internalEvt_HITGROUND:
						this._toState(PhyState.GROUND);
						break;
				}
				break;
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