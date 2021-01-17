import { Size } from "../Math/size";
import { Tensor } from "../Math/tensor";
import { IModelOption, LayerContext } from "../network";
import { LayerBase } from "./layerbase";

/**
 * 全连接层
 */
export class FullyConnectedLayer extends LayerBase{
    constructor(input:Size, opt:IModelOption){
        super();
		opt.size = Size.derive(opt.size!)

		this.dimensions = {
			input,
			output: opt.size,
			// 全连接的话，个数就是 输入节点的个数*本层节点的个数 + 本层节点的个数（bias）
			parameters: input.length * opt.size.length + opt.size.length
		}
        
    }

	// 前向
	forward(ctx:LayerContext) {
		var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length
		var inpw = ctx.input.w, outw = ctx.output.w, paramw = ctx.params.w
		
		// 所有的输出节点
		for (var i = 0; i < Y; i++) {
			sum = 0.0
			// 计算每个节点所有的输入的累加值
			for (var j = 0; j < X; j++) {
				sum += inpw[j] * paramw[i * X + j]
			}

			// 加上bias
			outw[i] = sum + paramw[X * Y + i]
		}

		// outw.set(this.fwd(inpw, paramw));
	}

	// 反向传播dw
	backward(ctx:LayerContext) {
		var sum = 0.0, X = this.dimensions.input.length, Y = this.dimensions.output.length
		var inpw = ctx.input.w, outw = ctx.output.w, paramw = (ctx.params as Tensor).w
		var inpdw = ctx.input.dw, outdw = ctx.output.dw, paramdw = (ctx.params as Tensor).dw

		// 对每个*输入*节点
		for (var i = 0; i < X; i++) {
			sum = 0.0
			// 所有的输出节点
			for (var j = 0; j < Y; j++) {
				sum += paramw[j * X + i] * outdw[j]
				paramdw[j * X + i] = inpw[i] * outdw[j]
			}

			inpdw[i] = sum
		}

		for (var i = 0; i < Y; i++) {
			paramdw[X * Y + i] = outdw[i]
		}
	}

	initialize(params) {
		if (this.options.init) {
			params.w.randf(this.options.init[0], this.options.init[1])
			return 
		}

		var X = this.dimensions.input.length, Y = this.dimensions.output.length
		var dropout = this.options.dropout || 0
		var elements = (1 - dropout) * (this.dimensions.input.length + this.dimensions.output.length)
		var scale = Math.sqrt(2.0 / elements)
		params.w.randn(0.0, scale)

		if (this.options.customInit) {
			this.options.customInit(params.w);
		}
	}	
}