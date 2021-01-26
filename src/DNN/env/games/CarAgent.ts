import { Plot } from "../../neurojs/Plot";
import { RLAgent } from "../RLAgent";
import { RLEnv } from "../RLEnv";
import { CarDQN } from "./CarDQN";
import * as tf from '@tensorflow/tfjs';

declare var neurojs:any;
/**
 * 控制代理，只负责训练和决策。
 */
export class CarAgent extends RLAgent{
    brain:CarDQN;
	age=0;
	plot:Plot;
	env:RLEnv;

    sample(state: number[]): number {
        throw new Error("Method not implemented.");
    }
    predict(state: number[]): number {
        throw new Error("Method not implemented.");
    }
    learn(state: number[], act: number[], reward: number, nextstate: number[], done: boolean): number {
        throw new Error("Method not implemented.");
    }

	init(env:RLEnv){
		this.env = env;
        let states = env.getStateNum();
        let acts = env.getActionSet();
		let actnum = acts.length;
		let config={
			states: states,
			actions: actnum,
			discount: 0.95, 
			// 经验回放数量？
			experience: 75e3, 
			// 每次从buffer采样的个数
			learningPerTick: 40, 
			startLearningAt: 100,
	
			theta: 0.05, // progressive copy
			alpha: 0.1 // advantage learning

		}
		this.brain = new CarDQN(env,states,acts, config.alpha, config.experience,config.learningPerTick);
	}

	getRandomAction(){

	}

	getStateTensor(){
		let buff = tf.buffer([1]);// 
		//buff.set()
	}

	playStep(){
		this.age++;
		let plot = this.plot;
		let brain = this.brain;
		brain.sample(this.env);

		//if (this.timer % this.timerFrequency === 0) {
			let state = this.updateInput();
			let car = this.car;
			//let speed = car.getSpeed();
			this.reward = this.getReward() ;// f(vel, contac, impact)
			plot.addData(1,this.reward);
			//if(Math.abs(speed)<1e-2){
				// 不动的话得分低
			//	this.reward=-1;
			//}

			let loss = this.loss = this.brain.learn(this.reward) as number;

			if(loss)
				plot.addData(0,loss)

			let action = this.brain.policy(state)
			if(action){
				this.outActions = action;
			}
			
			this.rewardBonus = 0.0
			//this.car.impact = 0			
		//}
		return this.loss;
	}
    

}