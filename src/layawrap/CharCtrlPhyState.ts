import { Body } from "../objects/Body";

export const enum PhyState {
	GROUND = 0,
	JUMPUP = 1,
	FALL = 2,
	FALLING = 3,
}

export const enum PhyEvent {
	STARTFALL = 1,	// 开始下落
	COLLIDE = 2,	// 发生碰撞
	JUMP = 3,		// 起跳
	HITGROUND = 4,	// 碰到地面
	TICK = 5,		// 时间相关
}

interface ISprite {
	event: (evt: string) => void;
}

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

	init(){
		
	}

	/**
	 * 每帧调用，自动检测速度
	 */
	tick(){
		let vel = this.phyBody.velocity;
		if (this.lastSpeedY > 0 && vel.y <= 0) {
			this.handlePhyState(PhyEvent.STARTFALL);
		}
		if (this.lastSpeedY < 0 && vel.y >= 0) {
			this.handlePhyState(PhyEvent.HITGROUND);
		}
		this.lastSpeedY = vel.y;
		this.handlePhyState(PhyEvent.TICK);
	}

	/**
	 * 发送事件引起内部状态变化。并可能触发owner的事件
	 * @param evt 
	 */
	handlePhyState(evt: PhyEvent) {
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
					case PhyEvent.STARTFALL:
						this._toState(PhyState.FALL);
						break;
				}
			}
			break;
			case PhyState.JUMPUP:
				switch(evt){
					case PhyEvent.STARTFALL:
						this._toState(PhyState.FALL);
						break;
					case PhyEvent.COLLIDE:
						//this.toState(physta)
						break;
					case PhyEvent.HITGROUND:
						this._toState(PhyState.GROUND);
						break;
				}
				break;
			case PhyState.FALL:{
				if(stateTm>100){
					this._toState(PhyState.FALLING);
				}
				switch(evt){
					case PhyEvent.JUMP:
						this._toState(PhyState.JUMPUP);
						break;
					case PhyEvent.HITGROUND:
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
					case PhyEvent.HITGROUND:
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
				if (last == PhyState.FALLING)
					owner.event('FallStop');
				break;
			case PhyState.FALLING:
				owner.event('FallStart');
				break;
			default:
				break;
		}
	}
}