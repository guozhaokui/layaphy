import { FullyConnectedLayer } from "./layers/dot";
import { DropOutLayer } from "./layers/dropout";
import { InputLayer } from "./layers/input";
import { LayerBase } from "./layers/layerbase";
import { Size } from "./Math/size";
import { Tensor } from "./Math/tensor";

export interface IModelOption{
    type:string;
	activation?:string;
	// 如果有的话表示dropout概率
    dropout?:number;		
    classes?:Float64Array;
    size?:Size|int; //softmax的时候
    probability?:boolean;
}

/**
 * 网络模型
 */
export class Model{
    representation:IModelOption[];
    layers:LayerBase[]=[];

    constructor(opt:IModelOption[]){
        this.representation=opt;
        this.build(opt);
    }

    build(opt:any[]){
        this.layers=[];
		var desc = Model.expand(opt)
		let input:Size|null = null;

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

    static create(inp:Size|null, opt:IModelOption):LayerBase{
		switch (opt.type) {
			case 'fc': return new FullyConnectedLayer(inp!,opt);
			case 'dropout': return new DropOutLayer(inp!, opt)
			//case 'sigmoid': return new nonlinear.SigmoidLayer(inp, opt)
			//case 'tanh': return new nonlinear.TanhLayer(inp, opt)
			case 'relu': return new nonlinear.ReLuLayer(inp, opt)
			case 'input': return new InputLayer(inp, opt)
			case 'regression': return new regression.RegressionLayer(inp, opt)
			case 'softmax': return new regression.SoftmaxLayer(inp, opt)
			//case 'noise': return new noise.UhlenbeckOrnsteinNoiseLayer(inp, opt)
			//case 'bayesian': return new bayesian.VariationalBayesianLayer(inp, opt)
			//case 'conf': return new bayesian.ConfidenceLayer(inp, opt)
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

	newConfiguration() {
		return new Configuration(this)
	}	
}

// defines how the network behaves; parameter/weights etc.
export class Configuration{
	model:Model;
	parameters:Tensor[];
	optimizer:any|null;
	// 总参数个数
	countOfParameters=0;

	constructor(model:Model, parameters?:Tensor[], optimizer?:any) {
		this.model = model
		this.parameters = []
		this.optimizer = null
		this.countOfParameters = 0  

		for (var i = 0; i < this.model.layers.length; i++) {
			var layer = this.model.layers[i]
			if (!layer.dimensions.parameters) {
				continue 
			}

			var param = this.parameters[i] = new Tensor(layer.dimensions.parameters)
			if (parameters && i in parameters) // copy from
				param.w.set(parameters[i].w)
			else if (layer.initialize) // initialize as new parameters
				layer.initialize(param)
			else  // random parameters
				param.w.randf(-1, 1)

			this.countOfParameters += layer.dimensions.parameters
		}

		if (optimizer) {
			this.useOptimizer(optimizer)
		}
	}

	newState() {
		return new State(this)
	}

}

// defines current network input/hidden/output-state; activations and gradients etc.
export class State{
    output:Float64Array;
    options:any;
    tensors:Tensor[] = [] // array of layer tensors; this.tensors[i] = output tensor of layer i
    contexts:LayerContext[] = [];
	configuration:Configuration;
	model:Model;
	layers:LayerBase[];
	in:Tensor;
	out:Tensor;
	private __l_in:LayerBase;
	private __l_out:LayerBase;

	private __target:Float64Array;

	constructor(configuration:Configuration) {
		this.configuration = configuration
		this.model = this.configuration.model
		this.layers = this.model.layers

		this.tensors = [] // array of layer tensors; this.tensors[i] = output tensor of layer i
		this.contexts = [] 

		// First input + output of every layer
		for (var i = 0; i < this.layers.length + 1; i++) {
			if (i > 0 && this.layers[i - 1].passthrough) // if passthrough, just use last tensor
				this.tensors[i] = this.tensors[i - 1]
			else // if at i = layers.length, then use output of last layer as tensor size
				this.tensors[i] = new Tensor(i < this.layers.length ? 
											this.layers[i].dimensions.input : 
											this.layers[i - 1].dimensions.output)
		}
		
		for (var i = 0; i < this.layers.length; i++) {
			var layer = this.layers[i]
			var context = this.contexts[i] = new LayerContext({
				input: this.tensors[i],
				output: this.tensors[i + 1],
				parameters: this.configuration.parameters[i],
				state: this
			})

			Object.each(layer.storage || {}, function (k:string, v:any) {
				(context as any)[k] = new Float64Array(!isNaN(v) ? v : v.length);
			})
		}
 
		this.in = this.tensors[0]
		this.out = this.tensors[this.layers.length]

		this.__target = new Float64Array(this.out.w.length)
		this.__l_in = this.layers[0]
		this.__l_out = this.layers[this.layers.length - 1]
	}


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