import { Size } from "../Math/size";
import { IModelOption, LayerContext } from "../network";
import { LayerBase } from "./layerbase";

class OutputLayer extends LayerBase{
    output=true;
    constructor(input:Size, opt:IModelOption){
		super();
		this.dimensions={
			input,
			output:input,
			parameters:0
		}
    }

	/**
	 * 
	 * @param ctx 
	 */
    result(ctx:LayerContext){

    }
}

class SoftmaxLayer extends OutputLayer{

}

export class RegressionLayer extends OutputLayer{
	passthrough=true;
	
    constructor(inp:Size, opt:IModelOption){
        super(inp,opt);
    }

    loss(ctx:LayerContext,desired:number|number[]|Float64Array){
        var loss = 0.0
        var grads = this.toGradientVector(desired, ctx.output.w)

        for (var i = 0; i < this.dimensions.input.length; i++) {
            loss += 0.5 * grads[i] * grads[i]
        }

        return loss
    }

    toGradientVector(desired:number|number[]|Float64Array, actual:number[], out:Float64Array|undefined):Float64Array {
        var X = this.dimensions.input.length

        if (out === undefined) {
            out = new Float64Array(X)
        }

        // target is maximizing argmax, set n-th value to 1, rest to 0
        if (X > 1 && !isNaN(desired as number) && Number.isInteger(desired) && desired < X) {
            for (var i = 0; i < X; ++i) {
                out[i] = actual[i] - (i === desired ? 1.0 : 0.0)
            }
        }
        // single value output
        else if (X === 1 && !isNaN(desired as number)) {
            out[0] = actual[0] - (desired as number)
        }

        else if (desired instanceof Array || desired instanceof Float64Array) {
            for (var i = 0; i < out.length; ++i) {
                out[i] = actual[i] - desired[i]
            }
        }

        else {
            throw 'invalid target'
        }

        return out

    }
}