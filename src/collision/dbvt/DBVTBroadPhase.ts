import { Broadphase } from "../Broadphase";
import { DBVT } from "./DBVT";
import { World } from "../../world/World";
import { Body } from "../../objects/Body";
import { DBVTProxy, DBVTNode } from "./DBVTNode";

/**
 * A broad-phase algorithm using dynamic bounding volume tree.
 *
 * @author saharan
 * @author lo-th
 */

export class DBVTBroadPhase extends Broadphase {
	tree = new DBVT();
	stack:DBVTNode[] = [];
	leaves:DBVTNode[] = [];
	numLeaves = 0;
	numPairChecks=0;

	constructor() {
		super();
	}

	createProxy(body:Body) {
		return new DBVTProxy(body);
	}

	addProxy(proxy: DBVTProxy) {
		this.tree.insertLeaf(proxy.leaf);
		this.leaves.push(proxy.leaf);
		this.numLeaves++;
	}

	removeProxy(proxy: DBVTProxy) {
		this.tree.deleteLeaf(proxy.leaf);
		// 删除leaves中记录的proxy
		var n = this.leaves.indexOf(proxy.leaf);
		if (n > -1) {
			this.leaves.splice(n, 1);
			this.numLeaves--;
		}
	}

	// 收集碰撞对信息
	collectPairs(p1:Body[], p2:Body[]) {
		if (this.numLeaves < 2) return;
		var leaf, margin = 0.1, i = this.numLeaves;
		while (i--) {
			leaf = this.leaves[i];
			if (leaf.proxy.aabb.overlaps(leaf.aabb)) {
				leaf.aabb.copy(leaf.proxy.aabb).margin(margin);
				this.tree.deleteLeaf(leaf);
				this.tree.insertLeaf(leaf);
				this.collide(leaf, this.tree.root, p1, p2);
			}
		}
	}

	collisionPairs(world: World, p1:Body[], p2:Body[]): void {
		this.collectPairs(p1,p2);
	}

	collide(node1:DBVTNode, node2:DBVTNode,p1:Body[], p2:Body[]) {
		let stackCount = 2;
		let b1:Body, b2:Body, n1, n2, l1, l2;
		this.stack[0] = node1;
		this.stack[1] = node2;

		while (stackCount > 0) {
			n1 = this.stack[--stackCount];
			n2 = this.stack[--stackCount];
			l1 = n1.proxy != null;
			l2 = n2.proxy != null;

			this.numPairChecks++;

			if (l1 && l2) {
				b1 = n1.proxy.body;
				b2 = n2.proxy.body;
				if (b1 == b2 || !b1.aabb.overlaps(b2.aabb) || !this.needBroadphaseCollision(b1, b2)) continue;

				p1.push(b1);
				p2.push(b2);
				
			} else {
				if (!n1.aabb.overlaps(n2.aabb)) continue;

				if (l2 || !l1 && (n1.aabb.surfaceArea() > n2.aabb.surfaceArea())) {
					this.stack[stackCount++] = n1.child1;
					this.stack[stackCount++] = n2;
					this.stack[stackCount++] = n1.child2;
					this.stack[stackCount++] = n2;
				} else {
					this.stack[stackCount++] = n1;
					this.stack[stackCount++] = n2.child1;
					this.stack[stackCount++] = n1;
					this.stack[stackCount++] = n2.child2;
				}
			}
		}
	}
}

