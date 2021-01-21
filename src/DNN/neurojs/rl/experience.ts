import { Agent } from "./agent"
import {Node} from "./replay-buffers"

export class Experience {
	// SARSA?
	/** 
	 * 状态。 这里是一个118长度的数据，例如每条射线的长度
	 * 0是上一次的
	 * 1是当前的
	 * state实际是整个input，包含上次state,上次act,这次state
	 */
	/** 上次的state */
	state0:Float64Array;
	/** 上次的action */
	action0:Float64Array;
	/** 上次的reward */
	reward0:number;
	/** 当前的state */
	state1:Float64Array;
	/** 当前的action */
	action1:Float64Array;

	agent:Agent;
	atAge:int;
	node:Node;

	learnSteps=0;
	lastLearnedAt=0;
	
	target:()=>number;//__q_target
	value:number;
	//TD error计算的loss。>0
	loss=0;

	constructor(agent:Agent) {
		this.agent = agent

		if (agent.options.type === 'sarsa')
			this.target = this.__sarsa_target
		else
			this.target = this.__q_target
	}	

	/**
	 * 评估target的Q值
	 * target的输出值 更新到reward
	 *  Q = r + γ()
	 */
	private __q_target() {
		return this.reward0 + this.agent.options.discount! * this.agent.evaluate(this.state1, true) // this.agent.value(this.state1, this.agent.act(this.state1, true), true)
	}

	private __sarsa_target() {
		return this.reward0 + this.agent.options.discount! * this.agent.value(this.state1, this.action1, true)
	}

	/**
	 * livenet的critic的输出值
	 * 上一次的状态和action的输出的Q
	 */
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