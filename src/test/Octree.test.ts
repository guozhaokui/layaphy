import { Octree } from "../utils/Octree";
import AABB from "../collision/AABB";
import Vec3 from "../math/Vec3";

test('construct',()=>{
    new Octree(new AABB());
});

test('insertRoot',()=>{
    const aabb = new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const tree = new Octree(aabb);

    const nodeAABB = new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const nodeData = 123;
    tree.insert(nodeAABB, nodeData);

    // Should end up in root node and not children
    expect(tree.data.length).toBe( 1);
    expect(tree.children.length).toBe( 0);
});

test('insertDeep',()=>{
    const aabb = new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const tree = new Octree(aabb, 8);

    const nodeAABB = new AABB(new Vec3(-1, -1, -1), new Vec3(-1, -1, -1));
    const nodeData = 123;

    tree.insert(nodeAABB, nodeData);

    // Should be deep (maxDepth deep) in lower corner
    expect(
        tree // level 0
            .children[0] // 1
            .children[0] // 2
            .children[0] // 3
            .children[0] // 4
            .children[0] // 5
            .children[0] // 6
            .children[0] // 7
            .children[0] // 8
    ).toBeTruthy();
    expect(tree.data.length).toBe( 0);
});

test('aabbQuery',()=>{
    const aabb = new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const tree = new Octree(aabb);

    const nodeAABB = new AABB(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const nodeData = 123;

    tree.insert(nodeAABB, nodeData);

    let result:number[] = [];
    tree.aabbQuery(aabb, result);

    expect(result).toEqual([123]);


    const nodeAABB2 = new AABB(new Vec3(-1, -1, -1), new Vec3(-1, -1, -1));
    const nodeData2 = 456;
    tree.insert(nodeAABB2, nodeData2);

    result = [];
    tree.aabbQuery(aabb, result);
    expect(result).toEqual([123, 456]);

    result = [];
    tree.aabbQuery(new AABB(new Vec3(0, 0, 0), new Vec3(1, 1, 1)), result);
    expect(result).toEqual([123]);
});

