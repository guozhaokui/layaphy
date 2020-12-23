import { Experience } from "./experience";

export interface IAgenOptions{
	type:'sarsa'|'q-learning';
	experience:number;
	discount?:number;
	states?:int;
}

export class Agent{
	options:IAgenOptions;
	acted=true;
	ready=false;
	age=0;

	constructor(opt:IAgenOptions) {

		this.options = Object.assign({

			type: 'q-learning', // sarsa or q-learning
			experience: 25e3,
			temporalWindow: 0,

			learningPerTick: 64,
			startLearningAt: 1000,

			buffer: Buffers.PrioritizedReplayBuffer,

			algorithm: 'ddpg',

			discount: opt.discount || 0.9,
			beta: 0.15, // how to prioritise experiences (0 = no prioritisation, 1 = full prioritisation)

		}, opt)

		// options
		this.states = this.options.states // state space
		this.actions = this.options.actions // action space
		this.input = Agent.getInputDimension(this.states, this.actions, this.options.temporalWindow) // extended state (over time)

		// settings
		this.buffer = new this.options.buffer(this.options.experience)
		this.history = {
			states: new Window(Math.max(2, this.options.temporalWindow)),
			actions: new Window(Math.max(2, this.options.temporalWindow)),
			inputs: new Window(2),
			rewards: new Window(2),
		}

		this.age = 1
		this.learning = true
		this.ready = true

		switch (this.options.algorithm) {
			case 'dqn':
				this.algorithm = new DQN(this); break
			case 'ddpg':
				this.algorithm = new DDPG(this); break
			default:
				throw 'unknown algorithm'
		}
	}    


	/**
	 * Adds an experience to the buffer and replays a batch of experiences
	 * 把一个experience加到buffer中，并回放若干experience
	 * @param  {Float} reward
	 * @return {Float}        The loss
	 */
	learn(reward:number) {
		if (!this.acted || !this.ready)
			return

		this.acted = false
		this.history.rewards.push(reward)

		// Learning happens always one step after actually experiencing
		if (this.history.states.size < 2 || this.learning === false) 
			return

		// Create new experience
		var e = new Experience(this)
		e.action0 = this.history.actions.get(1)
		e.state0 = this.history.inputs.get(1)
		e.reward0 = this.history.rewards.get(1)
		e.state1 = this.history.inputs.get(0)
		e.action1 = this.history.actions.get(0) // for SARSA only
		e.init() // set loss etc.

		// Add experience to replay buffer
		this.buffer.add(e)

		// Get older
		++this.age 

		return this.backward()
	}	
	/**
	 * 根据状态，动作等获得输入维度
	 * @param states 
	 * @param actions 
	 * @param temporalWindow 	TODO 不懂
	 */
	//static getInputDimension(states:int, actions:int, temporalWindow:int) {
	//	return states + temporalWindow * (states + actions)
	//}	
}