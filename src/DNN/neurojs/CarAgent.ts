import { AutoCar } from "./Car";
import { Agent } from "./rl/agent";

export class CarAgent{
	loss=0;
	reward=0;
	rewardBonus=0;

	timer=0;
	frequency=15;
	timerFrequency = 60/this.frequency;

	car = new AutoCar();
	brain:Agent;

	init(actor,critic){
		var actions = 2
		var temporal = 1
		let states = this.car.states;
		
		this.brain = new Agent({
				actor: actor,
				critic: critic,
		
				states: states,
				actions: actions,
		
				algorithm: 'ddpg',
		
				temporalWindow: temporal, 
		
				discount: 0.95, 
		
				// 经验回放数量？
				experience: 75e3, 
				// 每次从buffer采样的个数
				learningPerTick: 40, 
				startLearningAt: 900,
		
				theta: 0.05, // progressive copy
				alpha: 0.1 // advantage learning
		});


	}

	step(){
		this.timer++;
		if (this.timer % this.timerFrequency === 0) {
			//updateSensors()
			let car = this.car;
			let speed = car.phycar.getSpeed();
			this.reward;// f(vel, contac, impact)
			if(Math.abs(speed)<1e-2){
				// 不动的话得分低
				this.reward=-1;
			}
		}
	}

	/**
	 * 发生碰撞了。
	 * @param speed 
	 */
	onContact(speed:number){
		this.rewardBonus -= Math.max(50,speed);
	}
}