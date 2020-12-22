import { FullyConnectedLayer } from "./layers/dot";
import { DropOutLayer } from "./layers/dropout";
import { Size } from "./Math/size";

export interface IModelOption{
    type:string;
    activation?:string;
    dropout?:boolean;
    classes?:Float64Array;
    size?:Size; //softmax的时候
    probability?:boolean;
}

/**
 * 网络模型
 */
export class Model{
    representation:IModelOption[];
    layers=[];

    constructor(opt:IModelOption[]){
        this.representation=opt;
        this.build(opt);
    }

    build(opt:any[]){
        this.layers=[];
		var desc = Model.expand(opt)

		for(var i = 0; i < desc.length; i++) {
			var current = desc[i]
			var layer = Model.create(input, current)

			layer.label = current.label || undefined
			layer.index = i
			layer.model = this
			layer.options = current

			if (layer.dimensions.output)
				layer.size = layer.dimensions.output.length // convenience

			this.layers.push(layer)
			input = layer.dimensions.output
		}

		this.input = this.layers[0]
		this.output = this.layers[this.layers.length - 1]

    }

    static create(inp:Size, opt:IModelOption){
		switch (opt.type) {
			case 'fc': return new FullyConnectedLayer(inp,opt);
			case 'dropout': return new DropOutLayer(inp, opt)
			case 'sigmoid': return new nonlinear.SigmoidLayer(inp, opt)
			case 'tanh': return new nonlinear.TanhLayer(inp, opt)
			case 'relu': return new nonlinear.ReLuLayer(inp, opt)
			case 'input': return new input.InputLayer(inp, opt)
			case 'regression': return new regression.RegressionLayer(inp, opt)
			case 'softmax': return new regression.SoftmaxLayer(inp, opt)
			case 'noise': return new noise.UhlenbeckOrnsteinNoiseLayer(inp, opt)
			case 'bayesian': return new bayesian.VariationalBayesianLayer(inp, opt)
			case 'conf': return new bayesian.ConfidenceLayer(inp, opt)
		}

		throw 'error'
    }

	static expand(opt:IModelOption[]) {
		var description:IModelOption[] = []
		for (var i = 0; i < opt.length; i++) {
			var current = opt[i]

			if (current.type === 'softmax' && current.classes)
				description.push({ type: 'fc', size: current.classes })

			description.push(current)

			if (current.activation)
				description.push({ type: current.activation })

			if (current.dropout)
				description.push({ type: 'dropout', probability: current.dropout })
		}

        // 输出层必须是 softmax或者 regression
		if (![ 'softmax', 'regression' ].includes(description[description.length - 1].type))
			description.push({ type: 'regression' })

		return description
	}    
}

export class Configration{

}

// defines current network input/hidden/output-state; activations and gradients etc.
export class State{
    output:Float64Array;
    options:any;
    tensors = [] // array of layer tensors; this.tensors[i] = output tensor of layer i
    contexts:LayerContext[] = [];

	/**
	 * Evaluate network
	 * @param  {Float64Array} input
	 * @return {Float64Array} 
	 */
	forward(input:Float64Array, opt:any) {
		if (input != null) {
			this.__l_in.toInputVector(input, this.in.w) // use 'input' as input values, while converting it to a vector
		}

		this.options = opt || {} // set pass options
		this.activate() // activate all layers

		return this.output // return copy of output
	}

	/**
	 * Propagates error back, error is provided by subtracting desired from actual output values. 
	 * @param  {Float64Array | Int} desired
	 * @return {Float}         loss
	 */
	backward(desired:Float64Array|int) {
		if (desired != null) {
			this.__l_out.toGradientVector(desired, this.out.w, this.out.dw) // convert 'desired' to target vector
		}
		
		this.propagate() // propagate errors backwards

		return this.loss(desired) // return loss
	}    
}

export class LayerContext{
    input;
    output;
    params:number;
    state:State;
    constructor(opt:any){
        this.input = opt.input;
        this.output = opt.output;
        this.params = opt.params;
        this.state=opt.state;
    }
}