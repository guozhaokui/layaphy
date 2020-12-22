
export class Size{
	//[x][y][z]
    x:number;	
	y:number;
	// 
    z:number;

    constructor(x:number, y:number, z:number) {
        this.x=x;
        this.y=y;
        this.z=z;
    }

	static derive(val:Size|number|Object) {
		if (val instanceof Size) {
			return val;
		}

		if (Number.isInteger(val)) {
			return new Size(1, 1, val as number);
		}

		if (val instanceof Object) {
            //@ts-ignore
			return new Size(val.x, val.y, val.z)
		}

		throw "Could not create size object";
	}    

	get length() {
		return this.x * this.y * this.z
	}

	get dimensions() {
		if (this.x * this.y * this.z === 0)
			return 0

		if (this.x * this.y === 1)
			return 1

		if (this.x === 1)
			return 2

		return 3
	}	
}