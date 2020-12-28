import { Configuration } from './network';
import { NetworkWrapper } from './networkwrapper';
export class EventRadio {
	private events:{[key:string]:Function[];}

	constructor() {
		this.events = {}
	}


    // 响应
	on(event:string, callback:Function) {
		if (!(event in this.events)) {
			this.events[event] = []
		}

		this.events[event].push(callback)
	}

    // 触发
	trigger(event:string, args:any[] = []) {
		if (event in this.events) {
			for (var i = 0; i < this.events[event].length; i++) {
				this.events[event][i].apply(undefined, [this].concat(args));
			}
		}
	}

}

export class ConfigPool extends EventRadio {
    states:{[key:string]:NetworkWrapper[]}={};
	configs:{[key:string]:Configuration}={};
	// 请求优化的 Configuration 的name
    requested:string[]=[];

	constructor() {
		super()
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

	/**
	 * 执行优化。
	 * 前面请求的优化都执行一下
	 */
	step() {
		for (var i = 0; i < this.requested.length; i++) {
			var name = this.requested[i]
			this.configs[name].optimize(false)
		}

		this.requested = []
	}

	/**
	 * 请求优化
	 * @param wrapper 
	 */
	requestOptimisation(wrapper:NetworkWrapper) {
		if (wrapper.__pool_name === undefined || !(wrapper.__pool_name in this.configs)) 
			return false

		if (this.requested.indexOf(wrapper.__pool_name) >= 0)
			return true

		this.requested.push(wrapper.__pool_name)

		return true
	}

}

