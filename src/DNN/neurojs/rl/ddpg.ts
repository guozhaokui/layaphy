import { NetworkWrapper } from './../networkwrapper';
import { Agent, IAgenOptions } from "./agent";
import { Experience } from './experience';
import { ReplayBuffer } from "./replay-buffers";

class Algorithm {

	/**
	 * 根据状态决定动作。
	 * @param state 
	 * @param target  是否是计算target网络
	 */
	act(state:Float64Array, target?:boolean):Float64Array { throw 'Not implemented' }

	// how good is an action at state
	/**
	 * 评估一个动作的价值
	 * @param state 
	 * @param action 
	 * @param target 
	 */
	value(state:Float64Array, action:Float64Array, target=false):number { throw 'Not implemented' }

	// replay
	optimize(e:Experience, descent = true) { throw 'Not implemented' }

	// adjust weights etc
	learn() { throw 'Not implemented' }

	import(params) { throw 'Not implemented' }
	export() { throw 'Not implemented' }


	/**
	 * 评估选中动作的价值
	 * @param state 
	 * @param target 
	 */
	evaluate(state:Float64Array, target?:boolean) {
		return this.value(state, this.act(state, target), target)
	}

}

interface IDDPGOption{
	/** advantage learning (AL) http://arxiv.org/pdf/1512.04860v1.pdf; increase action-gap */
	alpha:number;
	/**soft target updates */
	theta:number;
	actor?:NetworkWrapper;
	critic?:NetworkWrapper;
}

/* Deep deterministic policy gradient */
export class DDPG extends Algorithm {
	actor: NetworkWrapper;
	critic: NetworkWrapper;
	options:IDDPGOption&IAgenOptions;
	agent:Agent;
	buffer:ReplayBuffer;
	// 输入维度
	input=118;
	targetActorUpdate

	constructor(agent: Agent) {
		super()
		// options
		this.options = Object.assign({
			alpha: 0, // advantage learning (AL) http://arxiv.org/pdf/1512.04860v1.pdf; increase action-gap
			theta: 0.001, // soft target updates
		}, agent.options)


		this.actor = new NetworkWrapper()
		this.critic = new NetworkWrapper()

		// target networks

		var targetCreate = (wrapper, state) => {
			wrapper.live = state

			if (this.options.theta < 1) {
				wrapper.target = wrapper.live.model.newState()
			}

			else {
				wrapper.target = wrapper.live
			}
		}

		this.actor.on('set', targetCreate)
		this.critic.on('set', targetCreate)

		// network validations

		this.actor.on('set', (wrapper, state) => {
			if (state.in.w.length !== this.agent.input) {
				throw 'actor input length insufficient'
			}

			if (state.out.w.length !== this.agent.actions) {
				throw 'actor output insufficient'
			}
		})

		this.critic.on('set', (wrapper, state) => {
			if (state.in.w.length !== this.agent.input + this.agent.actions) {
				throw 'critic input length insufficient'
			}

			if (state.out.w.length !== 1) {
				throw 'critic output length insufficient'
			}
		})

		// optimizer

		this.actor.useOptimizer({
			type: 'ascent',
			method: 'adadelta',
			regularization: { l2: 1e-2 }
		})

		this.critic.useOptimizer({
			type: 'descent',
			method: 'adadelta',
			regularization: { l2: 1e-3 }
		})

		// agent
		this.agent = agent

		this.input = agent.input
		this.buffer = agent.buffer

		// network weight updates
		this.targetActorUpdate = this.progressiveCopy.bind(this, this.actor)
		this.targetCriticUpdate = this.progressiveCopy.bind(this, this.critic)

		// adopt networks
		this.actor.set(this.options.actor)
		this.critic.set(this.options.critic)
	}

	targetNetworkUpdates() {
		this.actor.target.configuration.forEachParameter(this.targetActorUpdate)
		this.critic.target.configuration.forEachParameter(this.targetCriticUpdate)
	}

	/**
	 * 获得最佳act
	 * @param state 
	 * @param target 
	 */
	act(state:Float64Array, target:boolean) {
		if (target) {
			return this.actor.target.forward(state)
		}

		return this.actor.live.forward(state)
	}	

	/**
	 * 用critic网络估算Q值: Q(s,a)
	 * @param state  当前的状态
	 * @param action actor网络输出的动作
	 * @param target 是否是计算target网络
	 */
	value(state:Float64Array, action:Float64Array, target=false) {
		var net = target ? this.critic.target : this.critic.live

		net.in.w.set(state, 0)
		net.in.w.set(action, this.input)

		return net.forward()[0]
	}

	optimize(e:Experience, descent = true) {
		// target 网经验e的Q值
		var target = e.target()

		// 评估经验e的q值
		var value = e.estimate()

		var grad = value - target
		var gradAL = grad

		if (this.options.alpha > 0) {
			gradAL = grad + this.options.alpha * (value - this.evaluate(e.state0, true)) // advantage learning
		}

		if (descent) {
			var isw = this.buffer.getImportanceSamplingWeight(e)
			this.critic.live.backwardWithGradient(gradAL * isw)
			this.critic.live.configuration.accumulate()
			this.teach(e, isw)
		}

		return 0.5 * gradAL * gradAL // Math.pow(this.teach(e, isw, descent) - target, 2)
	}

	teach(e:Experience, isw = 1.0, descent = true) {
		var action = this.actor.live.forward(e.state0)  // which action to take?
		var val = this.value(e.state0, action) // how good will the future be, if i take this action?
		var grad = this.critic.live.derivatives(0, false) // how will the future change, if i change this action

		for (var i = 0; i < this.options.actions; i++) {
			this.actor.live.out.dw[i] = grad[this.input + i] * isw
		}

		if (descent) {
			this.actor.live.backward() // propagate change
			this.actor.config.accumulate()
		}
	}

	learn() {
		// Improve through batch accumuluated gradients
		this.actor.optimize()
		this.critic.optimize()
		
		// Copy actor and critic to target networks slowly
		this.targetNetworkUpdates()
	}

	progressiveCopy(net:NetworkWrapper, param, index) {
		if (this.options.theta >= 1) {
			return 
		}

		// _ = network in use, no _ = target network
		var _theta = this.options.theta, _paramw = net.config.parameters[index].w
		var  theta = 1.0 - _theta,        paramw = param.w

		for (var i = 0; i < param.w.length; i++) {
			paramw[i] = _theta * _paramw[i] + theta * paramw[i]
		}
	}	
}