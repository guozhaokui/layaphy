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
	// 节点个数
    size?:Size|int; //softmax的时候
    probability?:boolean;
}

/**
 * 网络模型
 * 
 * 只是网络的结构，不含运行时数据。
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

	newConfiguration() {
		return new Configuration(this)
	}

	newState() {
		return this.newConfiguration().newState()
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

}

/**
 * defines how the network behaves; parameter/weights etc.
 * 包含整个网络的运行时数据
 */
export class Configuration{
	model:Model;
	// 每一层的参数。注意有的层是空的。例如input，output，非线性层等，有的是fc层之类的。
	parameters:Tensor[];
	optimizer:any|null;
	// 总参数个数
	countOfParameters=0;


	constructor(model:Model, parameters?, optimizer?) {
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


	useOptimizer(optimizer) {
		if (optimizer.constructor === Object)
			optimizer = new Optim(optimizer)

		this.optimizer = optimizer
		this.forEachParameter(param => optimizer.initialize(param))

		return optimizer
	}

	freeze(val = true) {
		this.freezed = val
	}

	optimize(accu = true) {
		if (accu) this.accumulate(Number.isInteger(accu) ? accu : undefined)
		this.forEachParameter(param => this.optimizer.apply(param))
	}
	
	accumulate(weighted) {
		this.forEachParameter(param => this.optimizer.accumulate(param, weighted))
	}



	forEachParameter(cb) {
		if (this.freezed) return
		for (var i = 0; i < this.parameters.length; i++) { 
			var param = this.parameters[i]
			if (param === undefined) 
				continue

			cb(param, i)
		}
	}

	copyParametersFrom(config) {
		if (config.model !== this.model)
			throw 'models must match'

		this.forEachParameter((function (param, index) {
			param.w.set(config.parameters[index].w)
		}).bind(this))
	}


	newState() {
		return new State(this)
	}

	clone() {
		return new Configuration(this.model, this.parameters, this.optimizer)
	}


	/**
	 * 设置网络的权重
	 * @param arr 
	 */
	putWeights(arr:Float64Array) {
		var joined = arr

		if (arr.length !== this.countOfParameters)
			throw 'array doesnt match'

		for (var i = 0, p = 0; i < this.parameters.length; i++) { 
			var param = this.parameters[i]
			if (param === undefined) 
				continue

			param.w.set(joined.subarray(p, p + param.w.length))

			p += param.w.length
		}
	}

	/**
	 * 获取网络的权重
	 */
	pullWeights() {
		var joined = new Float64Array(this.countOfParameters)

		for (var i = 0, p = 0; i < this.parameters.length; i++) { 
			var param = this.parameters[i]
			if (param === undefined) 
				continue

			joined.set(param.w, p)

			p += param.w.length
		}

		return joined
	}


	share() {
		return new SharedConfiguration(this)
	}


}

// defines current network input/hidden/output-state; activations and gradients etc.
/**
 * 相当于整个网络的运行时数据？
 */
export class State{
    options:any;
    tensors:Tensor[] = [] // array of layer tensors; this.tensors[i] = output tensor of layer i
	contexts:LayerContext[] = [];
	// 每个State有自己的 configuration
	configuration:Configuration;
	model:Model;
	layers:LayerBase[];
	in:Tensor;
	out:Tensor;
	private __l_in:InputLayer;
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
		this.__l_in = this.layers[0] as InputLayer
		this.__l_out = this.layers[this.layers.length - 1]
	}


	/**
	 * Evaluate network
	 * @param   input
	 * @return 
	 */
	forward(input?:Float64Array|null, opt?:any|null) {
		if (input != null) {
			this.__l_in.toInputVector(input, this.in.w) // use 'input' as input values, while converting it to a vector
		}

		this.options = opt || {} // set pass options
		// 逐层计算
		this.activate() // activate all layers

		return this.output // return copy of output
	}

	/**
	 * Propagates error back, error is provided by subtracting desired from actual output values. 
	 * @param   desired
	 * @return        loss
	 */
	backward(desired:Float64Array|int):number {
		if (desired != null) {
			this.__l_out.toGradientVector(desired, this.out.w, this.out.dw) // convert 'desired' to target vector
		}
		
		this.propagate() // propagate errors backwards

		return this.loss(desired) // return loss
	}    

	/**
	 * Instead of regressing the network to have minimal error, you can provide your own gradient.
	 * @param  grad 如果多个输出，这个参数就是一个数组，否则就是一个数字
	 */
	backwardWithGradient(grad:Float64Array|number) {
		if((grad as Float64Array).length>1)
		//if (Array.isArray(grad))
			this.out.dw.set(grad as Float64Array)
		else if (this.out.dw.length === 1)
			this.out.dw[0] = grad as number
		else
			throw 'error grad not propagatable';

		this.propagate()
	}

	// get copy of current output
	get output():Float64Array {
		return this.__l_out.result(this.contexts[this.__l_out.index])
	}

	// get loss of current 
	loss(desired) {
		if (desired === undefined)
			return 

		return this.__l_out.loss(this.contexts[this.__l_out.index], desired)
	}


	/**
	 * not error gradient, but value gradient => how to increase/decrease n-th output value
	 * @param n 
	 * @param clone 
	 */
	derivatives(n:int, clone = true) {
		this.out.dw.fill(0.0)
		this.out.dw[n] = 1.0

		this.propagate()

		if (clone)
			return this.in.dw.clone()

		return this.in.dw
	}


	// forward pass
	// 前向过程。逐层计算
	activate() {
		for (var i = 0; i < this.layers.length; i++) {
			if (this.layers[i].passthrough) 
				continue ;

			this.layers[i].forward(this.contexts[i])
		}
	}

	// backwards pass
	propagate() {
		// safety check
		for (var i = 0; i < this.out.dw.length; i++) {
			if (isNaN(this.out.dw[i])) {
				throw 'warning: terror!';
			}
		}

		for (var i = this.layers.length - 1; i >= 0; i--) {
			if (this.layers[i].passthrough) 
				continue ;

			this.layers[i].backward(this.contexts[i])
		}
	}


}

export class LayerContext{
	// 输入值
	input:Tensor;	
	// 输出值
	output:Tensor;
	// 参数值。例如fc是inputNum*outputNum个
	params:number|Tensor;
	
    state:State;
    constructor(opt:any){
        this.input = opt.input;
        this.output = opt.output;
        this.params = opt.params;
        this.state=opt.state;
    }
}