import { RLEnv } from "../RLEnv";

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

	reset_game(){
		this.car.reset();
		this.totalReward=0;
	}

	/**
	 * 输入参数
	 */
	getActionSet(){
		return [1,2]
	}

	/**
	 * 获取状态
	 */
	getGameState(){

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