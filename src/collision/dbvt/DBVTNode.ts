import { AABB } from "../AABB";
import { Body } from '../../objects/Body';

export class DBVTProxy{
	body:Body;
	aabb:AABB
	leaf = new DBVTNode();
	constructor(body:Body){
		this.leaf.proxy = this;
	}
}


export class DBVTNode {
	child1: DBVTNode;
	child2: DBVTNode;
	parent: DBVTNode;
	// The proxy of this node. This has no value if this node is not leaf.
	proxy:DBVTProxy;
	// 节点的高度，从叶子算起，root的最高
	height = 0;
	aabb = new AABB();

	isLeaf(){
		return !!this.proxy;
	}
}

