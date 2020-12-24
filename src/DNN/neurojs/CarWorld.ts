import { ConfigPool } from './shared';
import { CarAgent } from "./CarAgent";
import { Model } from "./network";

interface IWorldBrain{
	actor:Model;
	critic:Model;
	shared?:ConfigPool
}

export class CarWorld{
	agents:CarAgent[]=[];
	brains:IWorldBrain;
	timer=0;

	constructor(){
		var input = 118, actions = 2
		this.brains = {
			actor: new Model([

				{ type: 'input', size: input },
				{ type: 'fc', size: 50, activation: 'relu' },
				{ type: 'fc', size: 50, activation: 'relu' },
				{ type: 'fc', size: 50, activation: 'relu', dropout: 0.5 },
				{ type: 'fc', size: actions, activation: 'tanh' },
				{ type: 'regression' }
	
			]),
	
	
			critic: new Model([
	
				{ type: 'input', size: input + actions },
				{ type: 'fc', size: 100, activation: 'relu' },
				{ type: 'fc', size: 100, activation: 'relu' },
				{ type: 'fc', size: 1 },
				{ type: 'regression' }
	
			])
	
		};
	}

	populate(n:int) {
		for (var i = 0; i < n; i++) {
			var ag = new CarAgent({}, this);
			this.agents.push(ag);
		}
	};	

	step(dt:number){
		if (dt >= 0.02)  dt = 0.02;
		++this.timer

		var loss = 0.0, reward = 0.0, agentUpdate = false
	}
}