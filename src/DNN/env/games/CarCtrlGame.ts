import { RLEnv } from "../RLEnv";
import * as tf from '@tensorflow/tfjs';

class SmpCar{
	vel=0;
	mass=1;
	pos=10;

	reset(){
		this.vel=0;
		this.mass=1;
		this.pos=10;
	}
}

export class CarCtrl extends RLEnv{
	car:SmpCar;
	totalReward=0;
	constructor(){
		super();
	}

	init(){
		this.car=new SmpCar();
	}

	getStateNum(): number {
		return 1;	// xpos
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
		this.car.reset();
		this.totalReward=0;
	}

	/**
	 * 输入参数
	 */
	getActionSet(){
		return [1,2];	//left, right
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
		switch(a){
			case 1:
				break;
			case 2:
				break;
		}
	}

	/**
	 * 执行某个连续量
	 * @param a 
	 * @param v 
	 */
	actA(a:number, v:number){

	}	
}