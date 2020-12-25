import { Configuration, Model, State } from "./network";
import { EventRadio } from "./shared";

export class NetworkWrapper extends EventRadio{
    net:State;
	option;
    model:Model;
	config:Configuration
	live:State;
	target:State;
    
	constructor(){
		super();
    }
    
	set(value:Configuration|State|Model) {
		var state!:State;

		if (!value) {
			return
		}

		if (value.constructor.name === 'State') {
			state = value as State
		}

		else if (value.constructor.name === 'Configuration' || value.constructor.name === 'Model') {
			state = (value as Configuration).newState()
		}

		this.net = state;
		this.config = state.configuration
		this.model = state.model

		this.trigger('set', [ state ])
	}    

    useOptimizer(optim){

    }
}