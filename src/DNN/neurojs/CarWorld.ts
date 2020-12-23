import { CarAgent } from "./CarAgent";
import { Model } from "./network";

export class CarWorld{
	agents:CarAgent[]=[];
	brains:{actor:Model, critic:Model};

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
}