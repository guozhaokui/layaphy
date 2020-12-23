import { Size } from "../Math/size";

export interface IDimention{
    input:Size;
    output:Size;
    // 参数个数
    parameters:Size
}

export class LayerBase{
    input=false;
    passthrough=false;
    dimensions:IDimention={} as any;
}

