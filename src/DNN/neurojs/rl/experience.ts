import { Agent } from "./agent"

export class Experience {
	agent:Agent;
	learnSteps=0;
	reward0;
	target;
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
}