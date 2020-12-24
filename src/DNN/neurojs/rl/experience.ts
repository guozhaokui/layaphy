import { Agent } from "./agent"
import {Node} from "./replay-buffers"

export class Experience {
	// action空间，是2d的，所以分0,1
	action0:Float64Array;
	action1:Float64Array;

	agent:Agent;
	atAge:int;
	node:Node;

	learnSteps=0;
	reward0:number;
	
	/** 
	 * 状态。 这里是一个118长度的数据，例如每条射线的长度
	 *  是2d的，所以分0,1
	 */
	state0:Float64Array;
	state1:Float64Array;

	target;//__q_target
	value:number;
	private __sarsa_target;
	private __q_target;
	loss=0;

	constructor(agent:Agent) {
		this.agent = agent

		if (agent.options.type === 'sarsa')
			this.target = this.__sarsa_target
		else
			this.target = this.__q_target
	}	

	private __q_target() {
		return this.reward0 + this.agent.options.discount * this.agent.evaluate(this.state1, true) // this.agent.value(this.state1, this.agent.act(this.state1, true), true)
	}

	private __sarsa_target() {
		return this.reward0 + this.agent.options.discount * this.agent.value(this.state1, this.action1, true)
	}


	step() {
		this.loss = this.agent.algorithm.optimize(this)

		this.learnSteps++
		this.lastLearnedAt = this.agent.age

		return this.loss
	}	

	init() {
		this.loss = this.agent.algorithm.optimize(this, false)
		this.atAge = this.agent.age
	}	
}