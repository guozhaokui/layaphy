import { ConfigPool } from './shared';
import { CarAgent } from "./CarAgent";
import { Model } from "./network";

declare var neurojs:any;

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
		//2*state+act
		var input = 16, actions = 2
		let actor =new neurojs.Network.Model([

			{ type: 'input', size: input },
			{ type: 'fc', size: 50, activation: 'relu' },
			{ type: 'fc', size: 50, activation: 'relu' },
			{ type: 'fc', size: 50, activation: 'relu', dropout: 0.5 },
			{ type: 'fc', size: actions, activation: 'tanh' },
			{ type: 'regression' }

		]);

		let critic = new neurojs.Network.Model([
	
			{ type: 'input', size: input + actions },
			{ type: 'fc', size: 100, activation: 'relu' },
			{ type: 'fc', size: 100, activation: 'relu' },
			{ type: 'fc', size: 1 },
			{ type: 'regression' }

		]);

		let config1 = new neurojs.Network.Configuration(actor);
		let config2 = new neurojs.Network.Configuration(critic);

		this.brains = {
			actor,
			critic
		};

		let shared = new neurojs.Shared.ConfigPool();
		this.brains.shared = shared;
		//@ts-ignore
		shared.set('actor', config1)
		//@ts-ignore
		shared.set('critic', config2)		

		// 添加agent
		this.populate(1);
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