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

	/**
	 * 根据input给out赋值。
	 * 如果input是整数，则表示是对应的输入为1，其他为0，
	 * 否则，就是直接拷贝
	 * @param input 
	 * @param out 
	 */
	toInputVector(input:Float64Array, out:Float64Array) {
		if (input === undefined)
			return 
		/*
		if (Number.isInteger(input) && input < this.dimensions.intrinsic) {
			out.fill(0.0)
			out[input as number] = 1.0
		} 
		else*/ if ((input as Float64Array).length === out.length) {
			out.set(input)
		} 
		else {
			throw 'invalid input format';
		}
	}

}