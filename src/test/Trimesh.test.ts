import {World} from "../world/World";
import {Body} from "../objects/Body";
import {Plane} from "../shapes/Plane";
import {Trimesh} from "../shapes/Trimesh";
import {Vec3} from "../math/Vec3";
import {Quaternion} from "../math/Quaternion";

test('updateNormals', () => {
    const mesh = Trimesh.createTorus();
    mesh.normals[0] = 1;
    mesh.updateNormals();
    expect(mesh.normals[0] !== 1).toBeTruthy();
});

test('updateAABB', () => {
    const mesh = Trimesh.createTorus();
    mesh.aabb.lowerBound.set(1, 2, 3);
    mesh.updateAABB();
    expect(mesh.aabb.lowerBound.y !== 2).toBeTruthy();
});

test('scaled', () => {
    const mesh = Trimesh.createTorus();
    mesh.updateTree();

    const bigMesh = Trimesh.createTorus();
    bigMesh.setScale(2, 2, 2);

    expect(bigMesh.aabb.upperBound.x).toBe(mesh.aabb.upperBound.x * 2);//, 'AABB does not scale with the mesh!');

    expect(bigMesh.tree.aabb.upperBound.x).toBe(mesh.tree.aabb.upperBound.x);//, 'Octree AABB scales with the mesh, which is wrong!');
});

test('unscaled', () => {
    const mesh = Trimesh.createTorus(1, 1, 32, 32);
    const result:number[] = [];

    // Should get all triangles if we use the full AABB
    const aabb = mesh.aabb.clone();
    mesh.getTrianglesInAABB(aabb, result);
    expect(result.length).toBe(mesh.indices.length / 3);

    // Should get less triangles if we use the half AABB
    result.length = 0;
    aabb.lowerBound.scale(0.1, aabb.lowerBound);
    aabb.upperBound.scale(0.1, aabb.upperBound);
    mesh.getTrianglesInAABB(aabb, result);

    console.log(result.length, mesh.indices.length / 3)

    expect(result.length < mesh.indices.length / 3).toBeTruthy();

});

// scaled: function(test){
//     var mesh = Trimesh.createTorus(1,1,16,16);
//     var result = [];

//     // Should get all triangles if we use the full AABB
//     var aabb = mesh.aabb.clone();
//     mesh.getTrianglesInAABB(aabb, result);
//     test.equal(result.length, mesh.indices.length / 3);

//     // Should get less triangles if we use the half AABB
//     result.length = 0;
//     aabb.lowerBound.scale(0.5, aabb.lowerBound);
//     aabb.upperBound.scale(0.5, aabb.upperBound);
//     mesh.getTrianglesInAABB(aabb, result);
//     test.ok(result.length < mesh.indices.length / 3);

//     test.done();
// }

//getVertex: {
test('unscaled', () => {
    const mesh = Trimesh.createTorus();
    const vertex = new Vec3();
    mesh.getVertex(0, vertex);
    expect(vertex).toEqual(new Vec3(mesh.vertices[0], mesh.vertices[1], mesh.vertices[2]));
});
test('scaled', () => {
    const mesh = Trimesh.createTorus();
    mesh.setScale(1, 2, 3);
    const vertex = new Vec3();
    mesh.getVertex(0, vertex);
    expect(vertex).toEqual( new Vec3(1 * mesh.vertices[0], 2 * mesh.vertices[1], 3 * mesh.vertices[2]));
});

test('getWorldVertex', () => {
    const mesh = Trimesh.createTorus();
    const vertex = new Vec3();
    mesh.getWorldVertex(0, new Vec3(), new Quaternion(), vertex);
    expect(vertex).toEqual( new Vec3(mesh.vertices[0], mesh.vertices[1], mesh.vertices[2]));
});

test('getTriangleVertices', () => {
    const mesh = Trimesh.createTorus();
    const va = new Vec3();
    const vb = new Vec3();
    const vc = new Vec3();
    const va1 = new Vec3();
    const vb1 = new Vec3();
    const vc1 = new Vec3();
    mesh.getVertex(mesh.indices[0], va);
    mesh.getVertex(mesh.indices[1], vb);
    mesh.getVertex(mesh.indices[2], vc);
    mesh.getTriangleVertices(0, va1, vb1, vc1);
    expect(va).toEqual(va1);
    expect(vb).toEqual(vb1);
    expect(vc).toEqual(vc1);
});

test('getNormal', () => {
    const mesh = Trimesh.createTorus();
    const normal = new Vec3();
    mesh.getNormal(0, normal);
    expect(new Vec3(mesh.normals[0], mesh.normals[1], mesh.normals[2])).toEqual( normal);
});

test('calculateLocalInertia', () => {
    const mesh = Trimesh.createTorus();
    const inertia = new Vec3();
    mesh.calculateLocalInertia(1, inertia);
});

test('computeLocalAABB', () => {
    console.warn('Trimesh::computeLocalAABB is todo');
});

test('updateBndSphR', () => {
    console.warn('Trimesh::updateBndSphR is todo');
});

test('calculateWorldAABB', () => {
    const poly = Trimesh.createTorus();
    const min = new Vec3();
    const max = new Vec3();
    poly.calculateWorldAABB(
        new Vec3(1, 0, 0), // Translate 2 x in world
        new Quaternion(0, 0, 0, 1),
        min,
        max
    );
    expect(!isNaN(min.x)).toBeTruthy();
    expect(!isNaN(max.x)).toBeTruthy();
});

test('volume', () => {
    const mesh = Trimesh.createTorus();
    expect(mesh.volume() > 0).toBeTruthy();
});

test('narrowphaseAgainstPlane', () => {
    const world = new World();

    const torusShape = Trimesh.createTorus();
    const torusBody = new Body(1);
    torusBody.addShape(torusShape);

    const planeBody = new Body(1);
    planeBody.addShape(new Plane());

    world.addBody(torusBody);
    world.addBody(planeBody);

    world.step(1 / 60);
});
