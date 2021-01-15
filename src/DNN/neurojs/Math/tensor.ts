import { Size } from "./size";

export interface IF64ArrExt extends Float64Array{
	/** 所有dw的累加 */
	acc:Float64Array
	iteration:int;
	gsum:Float64Array;
	xsum:Float64Array;
}

export class Tensor {
	size:Size;
	w:Float64Array;
	/** 反向传播的偏导？ */ 
	dw:IF64ArrExt;
	/** 添加了优化器信息了么 */
	initialized=false;
	constructor(size:Size) {
		this.size = Size.derive(size)
		this.w = new Float64Array(this.size.length);
		this.dw = new Float64Array(this.size.length) as IF64ArrExt;
	}
}