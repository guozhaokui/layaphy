import { DDPG } from "./ddpg";
import { Experience } from "./experience";
import { PrioritizedReplayBuffer } from "./replay-buffers";

export interface IAgenOptions{
	type:'sarsa'|'q-learning';
	experience:number;
	/** 收益折扣率 */
	discount?:number;
	states?:int;
	temporalWindow:int;
	beta:number;
	// 收集多少数据才开始训练。
	startLearningAt:int;
	/** 每次训练取出多少exp，例如40 */ 
	learningPerTick:int;
}

interface IHistory{
	/** states 保存window个状态记录，例如状态是xy，window大小为2， 则为 [xlast,ylast, xnow,ynow]  */
	states:_Window;
	actions:_Window;// new Window(Math.max(2, this.options.temporalWindow)),
	/** f64array的input记录。目前是上面的state,action加上当前的state */
	inputs:_Window;// new Window(2),
	rewards:_Window;// new Window(2),	
}

export class Agent{
	options:IAgenOptions;
	acted=true;
	age = 1
	// 是否训练。false的话在learn函数中会返回
	learning = true
	ready = true
	history:IHistory;
	algorithm:DDPG;
	buffer:PrioritizedReplayBuffer;

	training=false;
	// 输入维度？
	input:int;
	// 状态维度
	states=58;
	// action维度
	actions=2;

	constructor(opt:IAgenOptions) {

		this.options = Object.assign({

			type: 'q-learning', // sarsa or q-learning
			experience: 25e3,
			temporalWindow: 0,

			// 每次从buffer采样的个数
			learningPerTick: 64,
			startLearningAt: 1000,

			buffer: PrioritizedReplayBuffer,

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
			states: new _Window(Math.max(2, this.options.temporalWindow)),
			actions: new _Window(Math.max(2, this.options.temporalWindow)),
			inputs: new _Window(2),
			rewards: new _Window(2),
		}


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
	 * Let the agent make an action, includes exploration through noise
	 * 返回最终决策的行为
	 * @param   state	状态数组
	 * @return        An action
	 */
	policy(state:Float64Array) {
		if (!this.ready)
			return

		// 历史state，action加上当前的state组成input
		var input = this.getStateInputVector(state)
		// 放到网络里，计算生成的action
		var action = this.act(input)

		// 记录当前input,state,action
		this.history.inputs.push(input)
		this.history.states.push(state)
		this.history.actions.push(action)
		this.acted = true

		return action
	}	

	actionToVector(action) {
		if (action instanceof Float64Array) {
			return action
		}

		if (Number.isInteger(action)) {
			return Float64Array.oneHot(action, this.actions)
		}

		throw 'Action is invalid'
	}

	/**
	 * 获取一个输入vector， 包含指定个历史的(state+action)+当前的state  
	 * 目前的历史是1个
	 * 例如temporalWindow=1则是 58+2+58 = 118
	 * @param state 
	 */
	getStateInputVector(state:Float64Array) {
		if (this.options.temporalWindow > 0) {
			var input = new Float64Array(this.input)
			var cursor = 0
			
			for (var t = this.options.temporalWindow - 1; t >= 0; t--) {
				if (this.history.states.size > t) {
					// 先加上58个状态
					input.set(this.history.states.get(t), cursor);
					// 再加上2个action
					input.set(this.actionToVector( this.history.actions.get(t) ), cursor + this.states) 
				}
				
				cursor += this.states + this.actions
			}

			input.set(state, cursor)

			return input
		}

		return state
	}

	/**
	 * Adds an experience to the buffer and replays a batch of experiences
	 * 根据reward学习
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
		e.action0 = this.history.actions.get(1)	// A
		e.state0 = this.history.inputs.get(1)	// S
		e.reward0 = this.history.rewards.get(1)	// R
		e.state1 = this.history.inputs.get(0)	// S' 新状态
		e.action1 = this.history.actions.get(0) // A' for SARSA only
		e.init() // set loss etc.

		// Add experience to replay buffer
		this.buffer.add(e)

		// Get older
		++this.age 

		return this.backward()
	}	

	backward() {
		if (this.options.startLearningAt > this.age)
			return false

		// Set training
		this.training = true

		// Learn batch
		var loss = this.replay()

		// Execute algorithm
		this.algorithm.learn()
 
		return loss
	}

	replay() {		
		var batch = this.buffer.sample(this.options.learningPerTick), loss = 0.0

		for (var i = 0; i < batch.length; i++) {
			loss += batch[i].step()
		}

		this.buffer.updateAfterLearning(batch)

		return loss / batch.length
	}

	/**
	 * 获得最佳act
	 * 
	 * @param state 	输入状态，包含历史s,a 和当前状态 s
	 * @param target 
	 */
	act(state:Float64Array, target:boolean=false) {
		return this.algorithm.act(state, target)
	}	

	/**
	 * critic的值
	 * @param state 
	 * @param action 
	 * @param target 
	 */
	value(state:Float64Array, action:Float64Array, target?:boolean)  {
		return this.algorithm.value(state, action, target)
	}

	evaluate(state:Float64Array, target?:boolean) {
		return this.algorithm.evaluate(state, target)
	}	
	/**
	 * 根据状态，动作等获得输入维度
	 * @param states 
	 * @param actions 
	 * @param temporalWindow 	TODO 不懂
	 */
	static getInputDimension(states:int, actions:int, temporalWindow:int) {
		return states + temporalWindow * (states + actions)
	}	
}