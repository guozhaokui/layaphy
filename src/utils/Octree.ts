import AABB from '../collision/AABB.js';
import Vec3 from '../math/Vec3.js';
import Ray from '../collision/Ray.js';
import Transform from '../math/Transform.js';

/**
 * @class OctreeNode
 * @param {object} [options]
 * @param {Octree} [options.root]
 * @param {AABB} [options.aabb]
 */
export class OctreeNode<T> {
    /**
     * The root node
     */
    root: OctreeNode<T>;    //root 在构造完之后必须有值了

    /**
     * Boundary of this node
     */
    aabb = new AABB();

    /**
     * Contained data at the current node level.
     */
    data:T[] = [];

    maxDepth:f32=0;

    /**
     * Children to this node
     */
    children: OctreeNode<T>[] = [];
    constructor( root:OctreeNode<T>|null, options: { aabb?: AABB }) {
        if(root)
            root=root;
        if (options) {
            if(options.aabb) this.aabb= options.aabb.clone();
        }
    }

    reset(aabb?: AABB, options?: any) {
        this.children.length = this.data.length = 0;
    }

    /**
     * Insert data into this node
     */
    insert(aabb:AABB, elementData:T, level?:number) {
        const nodeData = this.data;
        level = level || 0;

        // Ignore objects that do not belong in this node
        if (!this.aabb.contains(aabb)) {
            return false; // object cannot be added
        }

        const children = this.children;

        if (level < (this.maxDepth || this.root.maxDepth)) {
            // Subdivide if there are no children yet
            let subdivided = false;
            if (!children.length) {
                this.subdivide();
                subdivided = true;
            }

            // add to whichever node will accept it
            for (let i = 0; i !== 8; i++) {
                if (children[i].insert(aabb, elementData, level + 1)) {
                    return true;
                }
            }

            if (subdivided) {
                // No children accepted! Might as well just remove em since they contain none
                children.length = 0;
            }
        }

        // Too deep, or children didnt want it. add it in current node
        nodeData.push(elementData);

        return true;
    }

    /**
     * Create 8 equally sized children nodes and put them in the .children array.
     */
    subdivide() {
        const aabb = this.aabb;
        const l = aabb.lowerBound;
        const u = aabb.upperBound;

        const children = this.children;
        const root = this.root || this;

        children.push(
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(0, 0, 0) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(1, 0, 0) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(1, 1, 0) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(1, 1, 1) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(0, 1, 1) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(0, 0, 1) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(1, 0, 1) }) }),
            new OctreeNode(root,{ aabb: new AABB({ lowerBound: new Vec3(0, 1, 0) }) })
        );

        u.vsub(l, halfDiagonal);
        halfDiagonal.scale(0.5, halfDiagonal);

        for (let i = 0; i !== 8; i++) {
            const child = children[i];
            // Compute bounds
            const lowerBound = child.aabb.lowerBound;
            lowerBound.x *= halfDiagonal.x;
            lowerBound.y *= halfDiagonal.y;
            lowerBound.z *= halfDiagonal.z;

            lowerBound.vadd(l, lowerBound);

            // Upper bound is always lower bound + halfDiagonal
            lowerBound.vadd(halfDiagonal, child.aabb.upperBound);
        }
    }

    /**
     * Get all data, potentially within an AABB
     * @return  The "result" object
     */
    aabbQuery(aabb:AABB, result:number[]) {

        //const nodeData = this.data;

        // abort if the range does not intersect this node
        // if (!this.aabb.overlaps(aabb)){
        //     return result;
        // }

        // Add objects at this level
        // Array.prototype.push.apply(result, nodeData);

        // Add child data
        // @todo unwrap recursion into a queue / loop, that's faster in JS
        //const children = this.children;


        // for (var i = 0, N = this.children.length; i !== N; i++) {
        //     children[i].aabbQuery(aabb, result);
        // }

        const queue = [this];
        while (queue.length) {
            const node = queue.pop() as OctreeNode<T>;
            if (node.aabb.overlaps(aabb)) {
                Array.prototype.push.apply(result, node.data);
            }
            Array.prototype.push.apply(queue, node.children);
        }

        return result;
    }

    /**
     * Get all data, potentially intersected by a ray.
     */
    rayQuery(ray:Ray, treeTransform:Transform, result:number[]) {

        // Use aabb query for now.
        // @todo implement real ray query which needs less lookups
        ray.getAABB(tmpAABB);
        tmpAABB.toLocalFrame(treeTransform, tmpAABB);
        this.aabbQuery(tmpAABB, result);

        return result;
    }

    /**
     * @method removeEmptyNodes
     */
    removeEmptyNodes() {
        const queue:OctreeNode<T>[] = [this];
        while (queue.length) {
            const node = queue.pop() as OctreeNode<T>;
            for (let i = node.children.length - 1; i >= 0; i--) {
                if (!node.children[i].data.length) {
                    node.children.splice(i, 1);
                }
            }
            Array.prototype.push.apply(queue, node.children);
        }
    }
}

/**
 * @class Octree
 * @param {AABB} aabb The total AABB of the tree
 * @param {object} [options]
 * @param {number} [options.maxDepth=8]
 * @extends OctreeNode
 */
export class Octree<T> extends OctreeNode<T> {
    maxDepth=8;
    constructor(aabb?:AABB, options?:{maxDepth?:number,aabb?:AABB}) {
        super(null,options as any);
        this.root=this;
        /**
         * Maximum subdivision depth
         */
        if(options){
            this.maxDepth = typeof (options.maxDepth) !== 'undefined' ? options.maxDepth : 8;
        }
    }
}

var halfDiagonal = new Vec3();
var tmpAABB = new AABB();
