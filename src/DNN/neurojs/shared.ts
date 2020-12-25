import { Configuration } from './network';
import { NetworkWrapper } from './networkwrapper';
export class EventRadio {

	constructor() {
		this.events = {}
	}


    // 响应
	on(event, callback) {
		if (!(event in this.events)) {
			this.events[event] = []
		}

		this.events[event].push(callback)
	}

    // 触发
	trigger(event, args = []) {
		if (event in this.events) {
			for (var i = 0; i < this.events[event].length; i++) {
				this.events[event][i].apply(undefined, [this].concat(args));
			}
		}
	}

}

export class ConfigPool extends EventRadio {
    states:any;
    configs:any;
    requested:any[];

	constructor() {
		super()
		this.states = {}
		this.configs = {}
		this.requested = []
	}

	add(name:string, wrapper:NetworkWrapper) {
		if (!(name in this.states)) {
			this.states[name] = []
		}

		if (name in this.configs) {
			wrapper.set(this.configs[name])
		}

		this.states[name].push(wrapper)
		wrapper.pool = this
		wrapper.__pool_name = name

		this.trigger('add', [ wrapper, name ])
		this.trigger('add ' + name, [ wrapper ])
	}

	set(name:string, config:Configuration) {
		if (name in this.states) {

			for (var i = 0; i < this.states[name].length; i++) {
				this.states[name][i].set(config)
			}

		}

		this.configs[name] = config
	}

	step() {
		for (var i = 0; i < this.requested.length; i++) {
			var name = this.requested[i]
			this.configs[name].optimize(false)
		}

		this.requested = []
	}

	requestOptimisation(wrapper) {
		if (wrapper.__pool_name === undefined || !(wrapper.__pool_name in this.configs)) 
			return false

		if (this.requested.indexOf(wrapper.__pool_name) >= 0)
			return true

		this.requested.push(wrapper.__pool_name)

		return true
	}

}

