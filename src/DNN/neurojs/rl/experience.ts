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
	 * 	不对
	 *  0 是live  1是target ?
	 */
	state0:Float64Array;
	state1:Float64Array;

	target:()=>number;//__q_target
	value:number;
	loss=0;

	constructor(agent:Agent) {
		this.agent = agent

		if (agent.options.type === 'sarsa')
			this.target = this.__sarsa_target
		else
			this.target = this.__q_target
	}	

	/**
	 *  Q = r + γ()
	 */
	private __q_target() {
		return this.reward0 + this.agent.options.discount! * this.agent.evaluate(this.state1, true) // this.agent.value(this.state1, this.agent.act(this.state1, true), true)
	}

	private __sarsa_target() {
		return this.reward0 + this.agent.options.discount! * this.agent.value(this.state1, this.action1, true)
	}

	estimate() {
		return this.value = this.agent.value(this.state0, this.action0)
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

	get priority() {
		if (this.loss === undefined)
			return undefined

		return Math.pow(this.loss, this.agent.options.beta || 0.5)
	}

}