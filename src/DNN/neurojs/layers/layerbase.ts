import { Size } from "../Math/size";
import { LayerContext } from "../network";

export interface IDimention{
    input:Size;
    output:Size;
    // 参数个数
    parameters:Size|int
}

export class LayerBase{
    input=false;
    passthrough=false;
	dimensions:IDimention={} as any;

	forward(ctx:LayerContext){};
	backward(ctx:LayerContext){};
}

