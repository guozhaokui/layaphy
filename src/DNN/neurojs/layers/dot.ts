import { Size } from "../Math/size";
import { IModelOption, LayerContext } from "../network";
import { IDimention, LayerBase } from "./layerbase";

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
			parameters: input.length * opt.size.length + opt.size.length
		}
        
    }

    initialize(){

    }

    forward(ctx:LayerContext){

    }

    backward(ctx:LayerContext){

    }
}