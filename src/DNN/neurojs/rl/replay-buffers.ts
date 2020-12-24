import { Experience } from "./experience";

export class ReplayBuffer {

	add(e:Experience) { throw 'not implemented' }
	sample(n:int):Experience[] { throw 'not implemented' }
	getAverageLoss() { throw 'not implemented' }
	getImportanceSamplingWeight(e) { return 1.0 }
	updateAfterLearning() {}

}

export class Node {
	value=0.0;
	size=1;
	maximum = -Infinity
	minimum = Infinity

	experience:Experience;
	parent:Node|null;
	// SumTree 二叉树结构
	children:Node[]=[];

	constructor(parent:Node|null, experience:Experience) {
		this.parent = parent
		this.experience = experience
		this.revalue()
	}


	/**
	 * 根据x选择一个节点
	 * 
	 * @param x 
	 */
	cumulativeSample(x:number):Node{
		if (this.children.length === 0)
			return this;

		if (this.children[0].value < x)
			// 右枝
			return this.children[1].cumulativeSample(x - this.children[0].value);
		else 
			// 左枝
			return this.children[0].cumulativeSample(x);
	} 

	update() {
		this.value = Array.sum(this.children, x => x.value)
		this.maximum = this.children.reduce((a, b) => a.maximum > b.maximum ? a : b).maximum
		this.minimum = this.children.reduce((a, b) => a.minimum < b.minimum ? a : b).minimum

		if (this.parent)
			this.parent.update()
	}

	revalue() {
		if (this.children.length > 0)
			throw 'not possible'

		if (!this.experience)
			return 

		this.value = this.experience.priority || Infinity

		this.maximum = this.value
		this.minimum = this.value

		if (this.parent)
			this.parent.update()
	}

	/**
	 * 设置节点的exp
	 * @param experience 
	 */
	set(experience:Experience) {
		if (this.children.length > 0)
			throw "can't set experience of node with children"

		experience.node = this

		this.experience = experience
		this.revalue()
	}

	add(experience) {
		if (this.children.length === 0) { // branch off
			this.children.push(new PrioritizedReplayBuffer.Node(this, this.experience))
			this.children.push(new PrioritizedReplayBuffer.Node(this, experience))
			this.experience = null

			// this.update()
		} else {
			this.children.reduce((a, b) => a.size < b.size ? a : b).add(experience)
		}

		this.size++
	}

	descent(dir) {
		if (this.children.length === 0)
			return this

		return this.children[ dir(this.children[0], this.children[1]) ].descent(dir)
	}

	/**
	 * 得到所有的叶子节点
	 */
	getLeafs():Node[] {
		if (this.children.length === 0)
			return [ this ]

		var unfolded = []
		for (var i = 0; i < this.children.length; i++) {
			unfolded.push(this.children[i].getLeafs())
		}

		return Array.prototype.concat.apply([], unfolded)
	}

}

/**
 * 有优先级的回放池
 * 优先级会影响被采样的频率
 */
export class PrioritizedReplayBuffer extends ReplayBuffer {
	static Node=Node;
	root:Node;
	iterations=0;
	size=0;
	beta=0.5;
	maxISW=1.0;
	leafs:Node[]=[];

	constructor(N:int) {
		super()
		this.root = new PrioritizedReplayBuffer.Node(null, null)

		for (var i = 0; i < N - 1; ++i) {
			this.root.add(null)
		}

		this.leafs = this.root.getLeafs()

		if (this.leafs.length !== this.root.size)
			throw 'could not create replay tree...'
	}

	/**
	 * 添加一个经验
	 * @param e 
	 */
	add(e:Experience) {
		if (this.size === this.leafs.length) {
			this.root.descent((a, b) => a.minimum < b.minimum ? 0 : 1).set(e)
		}
		else {
			// 新的经验只加到叶节点上
			this.leafs[this.size].set(e)
		}
		
		this.iterations += 1
		this.size = Math.max(this.size, this.iterations % this.leafs.length)
	}

	/**
	 * 取样n个记录
	 * @param n 
	 */
	sample(n:int) { 
		var batch:Experience[] = []

		this.maxISW = Math.pow(this.size * (this.root.minimum / this.root.value), -this.beta)

		if (this.size < 5 * n) 
			return [ ]

		while (batch.length < n)
			batch.push(this.root.cumulativeSample(Math.random() * this.root.value).experience)

		return batch
	}

	draw(prioritised) {
		if (!prioritised) 
			return this.leafs[Math.randi(0, this.size)].experience

		return this.root.cumulativeSample(Math.random() * this.root.value).experience
	}

	updateAfterLearning(batch:Experience[]) {
		for (var i = 0; i < batch.length; i++) {
			var e = batch[i]
			if (e !== e.node.experience)
				throw 'association error'

			e.node.revalue()
		}
	}

	getImportanceSamplingWeight(e) { 
		if (e.priority === undefined)
			return 1.0

		return Math.pow(this.size * (e.priority / this.root.value), -this.beta)
	}

	getAverageLoss() {
		return this.root.value / this.root.size
	}

}