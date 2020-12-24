import { NetworkWrapper } from './../networkwrapper';
import { Agent } from "./agent";
import { Experience } from './experience';
import { ReplayBuffer } from "./replay-buffers";

class Algorithm {

	// what to do?
	act(state, target) { throw 'Not implemented' }

	// how good is an action at state
	value(state, action, target) { throw 'Not implemented' }

	// replay
	optimize(e, descent = true) { throw 'Not implemented' }

	// adjust weights etc
	learn() { throw 'Not implemented' }

	import(params) { throw 'Not implemented' }
	export() { throw 'Not implemented' }


	evaluate(state, target) {
		return this.value(state, this.act(state, target), target)
	}

}


/* Deep deterministic policy gradient */
export class DDPG extends Algorithm {
	actor: NetworkWrapper;
	critic: NetworkWrapper;
	options:any;
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

	learn() {
		// Improve through batch accumuluated gradients
		this.actor.optimize()
		this.critic.optimize()

		// Copy actor and critic to target networks slowly
		this.targetNetworkUpdates()
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

	optimize(e:Experience, descent = true) {
		var target = e.target()
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