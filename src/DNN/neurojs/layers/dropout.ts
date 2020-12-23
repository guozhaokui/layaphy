import { Size } from "../Math/size";
import { IModelOption, LayerContext } from "../network";
import { LayerBase } from "./layerbase";

/**
 * dropout层。
 * 让本层的节点以一定的概率停止工作。防止网络对某些局部特征的依赖，提高泛化能力，防止过拟合
 */
export class DropOutLayer extends LayerBase{
    probability:number;

    constructor(input:Size, opt:IModelOption){
		super();
        this.probability=opt.probability;
    }

    forward(ctx:LayerContext) {
    }

    backward(ctx:LayerContext) {
    }
}