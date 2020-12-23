import { Size } from "../Math/size";
import { LayerBase } from "./layerbase";

export class InputLayer extends LayerBase{
	input=true;
	passthrough=true;

    constructor(inp:Size|null, opt:any){
        super();
		this.dimensions = {
			input: Size.derive(opt.size),
			output: Size.derive(opt.size),
			parameters: 0
		};
    }
}