import { Configuration, Model, State } from "./network";
import { ConfigPool, EventRadio } from "./shared";

/**
 * 给DDPG的网络
 */
export class NetworkWrapper extends EventRadio{
    net:State;
	option:any;
    model:Model;
	config:Configuration
	// 当前网络，实时
	live:State;
	// target网络，定期更新
	target:State;
	// 这个对象对应的pool对象
	pool:ConfigPool;
	// 在pool中的key值
	__pool_name:string;

	optim:any;

	constructor(){
		super();
    }
    
	set(value:Configuration|State|Model) {
		var state:State;

		if (!value) {
			return
		}

		if (value.constructor.name === 'State') {
			state = value as State
		}

		else if (value.constructor.name === 'Configuration' || value.constructor.name === 'Model') {
			state = (value as Configuration).newState()
		}

		this.net = state!;
		this.config = state!.configuration
		this.model = state!.model

		this.trigger('set', [ state! ])
	}    

	/**
	 * 设置 优化器
	 * @param optim 
	 */
    useOptimizer(optim){
		this.optim = optim;

		if (this.config) {
			this.config.useOptimizer(optim);
		}
    }
}