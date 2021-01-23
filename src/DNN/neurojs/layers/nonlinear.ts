import { Size } from "../Math/size";
import { LayerContext } from "../network";
import { LayerBase } from "./layerbase";


export class NonLinearityLayer extends LayerBase{

	constructor(input:Size, opt:any) {
		super();
		this.dimensions = {
			input,
			output: input,
			// 这个是虚拟层，都没有权重，
			parameters: 0
		};
	}

}

export class SigmoidLayer extends NonLinearityLayer {

	forward(ctx:LayerContext) {
		var X = this.dimensions.input.length;
		var inpw = ctx.input.w, outw = ctx.output.w

		for (var i = 0; i < X; i++) {
			outw[i] = 1 / (1 + Math.exp(-inpw[i]))
		}
	}

	backward(ctx:LayerContext) {
		var X = this.dimensions.input.length
		var inpw = ctx.input.w, outw = ctx.output.w
		var inpdw = ctx.input.dw, outdw = ctx.output.dw

		for (var i = 0; i < X; i++) {
			inpdw[i] = outw[i] * (1.0 - outw[i]) * outdw[i]
		}
	}

}

export class TanhLayer extends NonLinearityLayer {

	forward(ctx:LayerContext) {
		var X = this.dimensions.input.length
		var inpw = ctx.input.w, outw = ctx.output.w
		var y = 0.0;

		for (var i = 0; i < X; i++) {
			y = Math.exp(2 * inpw[i]);
			outw[i] = (y - 1) / (y + 1);
		}
	}

	backward(ctx:LayerContext) {
		var X = this.dimensions.input.length
		var inpw = ctx.input.w, outw = ctx.output.w
		var inpdw = ctx.input.dw, outdw = ctx.output.dw

		for (var i = 0; i < X; i++) {
			inpdw[i] = (1 - outw[i] * outw[i]) * outdw[i];
		}
	}

}

export class ReLuLayer extends NonLinearityLayer {
	// 是否是带泄露的函数。即<0的时候的斜率。为0就是普通的relu
	leaky=0;

	constructor(input:Size, opt:any) {
		super(input, opt)
		this.leaky = opt.leaky || 0
	}

	forward(ctx:LayerContext) {
		var X = this.dimensions.input.length
		var inpw = ctx.input.w, outw = ctx.output.w
		var y = 0.0;

		for (var i = 0; i < X; i++) {
			outw[i] = inpw[i] > 0.0 ? inpw[i] : this.leaky * inpw[i];
		}
	}

	backward(ctx:LayerContext) {
		var X = this.dimensions.input.length
		var inpw = ctx.input.w, outw = ctx.output.w
		var inpdw = ctx.input.dw, outdw = ctx.output.dw

		for (var i = 0; i < X; i++) {
			inpdw[i] = inpw[i] > 0.0 ? outdw[i] : this.leaky * outdw[i];
		}
	}

}

