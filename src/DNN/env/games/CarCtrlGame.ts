import { RLEnv } from "../RLEnv";
import * as tf from '@tensorflow/tfjs';

class SmpCar{
	vel=0;
	mass=1;
	pos=10;
	force=1;
	dvel=0.2;

	reset(){
		this.vel=0;
		this.mass=1;
		this.pos=10;
	}
	left(){
		//let a= this.force/this.mass;
		this.vel-=this.dvel;
	}
	right(){
		this.vel+=this.dvel;
	}
	acc(){

	}
	brake(){
		this.vel*=0.9;
	}
	step(dt:number){
		this.pos+=this.vel*dt;
	}
}

export class CarCtrl extends RLEnv{
	car:SmpCar;
	totalReward=0;
	lastpos=0;
	lastState=[0,0];
	stateNotChange=0;	
	constructor(){
		super();
	}

	getStateNum(): number {
		return 5000;	// xpos
	}
	getStateShape():number[]{
		return [40,2];
	}

	getStateTensor(){
		let buff = tf.buffer([1]);// 
		buff.set(this.car.pos,0);
	}


	score(): number {
		throw new Error("Method not implemented.");
	}
	game_over(): boolean {
		throw new Error("Method not implemented.");
	}

	reset_game(){
		this.car = new SmpCar();
		this.car.reset();
		this.totalReward=0;
		this.lastpos=this.car.pos;
		this.lastState=[0,0];
		this.stateNotChange=0;
		return [this.car.pos];
	}

	/**
	 * 输入参数
	 */
	getActionSet(){
		return [0,1,2,3];	//none, left, right,刹车
	}

	/**
	 * 获取状态
	 */
	getGameState():number[]{
		return [];
	}

	/**
	 * 执行某个动作
	 * @param a 
	 */
	act(a:number){
		let car = this.car;
		switch(a){
			case 1:
				this.car.left();
				break;
			case 2:
				this.car.right();
				break;
			case 3:
				this.car.brake();
				break;
			case 4:
				break;
		}
	}

	/**
	 * 得到游戏状态，奖励等信息
	 */
	checkGame():{state:number[], reward:number, done:boolean}{
		let car = this.car;
		let r =  Math.abs(this.lastpos) - Math.abs(car.pos);
		let still=false;
		if(this.lastpos==car.pos){
			// 如果不动，不行
			still=true;
		}
		this.lastpos= car.pos;
		let done=false;
		let s=[0,0];
		if(Math.abs(car.pos)>10 || Math.abs(car.vel)>10){
			r=-100;
			done=true;
		}else{
			let spos = Math.round(car.pos*2)+20; // 0,40
			let svel = Math.round(car.vel*2)+20; // 0,40
			s[0]=spos;
			s[1]=car.vel<=0?0:1;

			// 如果在中心且基本静止，很好
			if(Math.abs(car.vel)<0.1 && Math.abs(car.pos)<0.2){
				r=100;
				done=true;
			}else{
				if(still){
					r=-100;
					done=true;
				}
			}
		}
		return {state:s,reward:r,done:done}
	}

	clamp(v:number, min:number, max:number){
		return Math.max(Math.min(v,max),min)
	}
	gameStep(){
		let dt = 1/16;
		let car = this.car;
		let lastS = this.lastState;
		car.step(dt);
		// 检查是否发生状态、reward的变化，需要通知agent
		let s=[0,0];
		let spos = Math.round(car.pos*2)+20; // 0,40
		let svel = Math.round(car.vel*2)+20; // 0,40
		s[0]=this.clamp(spos,0,39);
		s[1]=car.vel<=0?0:1;

		let done=false;
		if(Math.abs(car.pos)>10){
			lastS[0]=s[0];
			lastS[1]=s[1];
			return {state:s,reward:-100,done:true}
		}
		if(Math.abs(car.vel)<0.1 && Math.abs(car.pos)<0.2){
			lastS[0]=s[0];
			lastS[1]=s[1];
			// 到达中心了，且速度很低了
			return {state:s,reward:100,done:true}
		}


		if(s[0]==lastS[0] && s[1]==lastS[1]){
			this.stateNotChange++;
		}

		if(this.stateNotChange>100 && Math.abs(this.car.vel)<0.001){
			// 长时间不动的
			lastS[0]=s[0];
			lastS[1]=s[1];
			this.lastpos=car.pos;
			return {state:s,reward:-100,done:false}
		}

		if(s[0]!=lastS[0] || s[1]!=lastS[1] ){
			let r =  Math.abs(this.lastpos) - Math.abs(car.pos);
			lastS[0]=s[0];
			lastS[1]=s[1];
			this.lastpos=car.pos;
			return {state:s,reward:r,done:false}
		}

		return null;
	}

	/**
	 * 执行某个连续量
	 * @param a 
	 * @param v 
	 */
	actA(a:number, v:number){

	}	
}