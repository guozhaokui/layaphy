import { Size } from "./size";

export class Tensor {
	size:Size;
	w:Float64Array;
	dw:Float64Array;
	constructor(size:Size) {
		this.size = Size.derive(size)
		this.w = new Float64Array(this.size.length);
		this.dw = new Float64Array(this.size.length);
	}
}