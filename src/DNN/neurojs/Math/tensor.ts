import { Size } from "./size";

export interface IF64ArrExt extends Float64Array{
	acc:Float64Array
	iteration:int;
}

export class Tensor {
	size:Size;
	w:Float64Array;
	/** 反向传播的偏导？ */ 
	dw:IF64ArrExt;
	initialized=false;
	constructor(size:Size) {
		this.size = Size.derive(size)
		this.w = new Float64Array(this.size.length);
		this.dw = new Float64Array(this.size.length) as IF64ArrExt;
	}
}