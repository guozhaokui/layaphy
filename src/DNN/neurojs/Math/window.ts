class _Window {
	// 记录的数据。 0是最新的
	private list:any[]=[];
	// 设置的长度
    private length:int;

	constructor(n:int) {
		this.list = []
		this.length = n
	}

	// 
	push(value:any) {
		this.list.unshift(value)

		if (this.list.length > this.length) {
			this.list.pop()
		}
	}

	get(nth:int) {
		return this.list[nth]
	}

	get size() {
		return this.list.length
	}

}
