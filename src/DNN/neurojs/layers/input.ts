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
	
	toInputVector(input, out) {
		if (input === undefined)
			return 

		if (Number.isInteger(input) && input < this.dimensions.intrinsic) {
			out.fill(0.0)
			out[input] = 1.0
		} 

		else if (input.length === out.length) {
			out.set(input)
		} 

		else {
			throw 'invalid input format';
		}
	}

}