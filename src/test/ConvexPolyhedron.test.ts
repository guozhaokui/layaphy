import {Box} from "../shapes/Box";
import {Vec3} from "../math/Vec3";
import {Quaternion} from "../math/Quaternion";
import {ConvexPolyhedron, hitInfo } from "../shapes/ConvexPolyhedron";

function createBoxHull(size = 0.5) {
    const box = new Box(new Vec3(size, size, size));
    return box.convexPolyhedronRepresentation;
}

test('calculateWorldAABB', () => {
    const poly = createPolyBox(1, 1, 1);
    const min = new Vec3();
    const max = new Vec3();
    poly.calculateWorldAABB(new Vec3(1, 0, 0), // Translate 2 x in world
        new Quaternion(0, 0, 0, 1),
        min,
        max);
    expect(min.x).toBe(0);
    expect(max.x).toBe(2);
    expect(min.y).toBe(-1);
    expect(max.y).toBe(1);
});

test('clipFaceAgainstPlane', () => {
    const h = createBoxHull();

    // Four points 1 unit below the plane z=0 - we assume to get back 4
    let inverts = [new Vec3(-0.2, -0.2, -1),
    new Vec3(-0.2, 0.2, -1),
    new Vec3(0.2, 0.2, -1),
    new Vec3(0.2, -0.2, -1)];
    let outverts:Vec3[] = [];
    h.clipFaceAgainstPlane(inverts, outverts, new Vec3(0, 0, 1), 0.0);
    expect(outverts.length).toBe(4);//, "did not get the assumed 4 vertices");
    inverts = [];
    outverts = [];

    // Lower the plane to z=-2, we assume no points back
    h.clipFaceAgainstPlane(inverts, outverts, new Vec3(0, 0, 1), 2);
    expect(outverts.length).toBe(0);//, 0, "got more than zero vertices left after clipping!");

    // two points below, two over. We get four points back, though 2 of them are clipped to
    // the back of the  plane
    const inverts2 = [new Vec3(-2, -2, 1),
    new Vec3(-2, 2, 1),
    new Vec3(2, 2, -1),
    new Vec3(2, -2, -1)];
    outverts = [];
    h.clipFaceAgainstPlane(inverts2, outverts, new Vec3(0, 0, 1), 0.0);
    expect(outverts.length).toBe(4);//, 4, `Expected 4 points back from clipping a quad with plane, got ${outverts.length}`);
});

test('clipFaceAgainstHull', () => {
    // Create box
    const hullA = createBoxHull(0.5);
    const res:hitInfo[] = [];
    const sepNormal = new Vec3(0, 0, 1);

    // Move the box 0.45 units up - only 0.05 units of the box will be below plane z=0
    const posA = new Vec3(0, 0, 0.45);

    const quatA = new Quaternion();

    // All points from B is in the plane z=0
    const worldVertsB = [new Vec3(-1.0, -1.0, 0),
    new Vec3(-1.0, 1.0, 0),
    new Vec3(1.0, 1.0, 0),
    new Vec3(1.0, -1.0, 0)];

    // We will now clip a face in hullA that is closest to the sepNormal
    // against the points in worldVertsB.
    // We can expect to get back the 4 corners of the box hullA penetrated 0.05 units
    // into the plane worldVertsB we constructed
    hullA.clipFaceAgainstHull(sepNormal, posA, quatA, worldVertsB, -100, 100, res);
});

test('clipAgainstHull', () => {
    const hullA = createBoxHull(0.6);
    const posA = new Vec3(-0.5, 0, 0);
    const quatA = new Quaternion();
    const hullB = createBoxHull(0.5);
    const posB = new Vec3(0.5, 0, 0);
    const quatB = new Quaternion();

    const sepaxis = new Vec3();
    const found = hullA.findSeparatingAxis(hullB, posA, quatA, posB, quatB, sepaxis,null,null);
    console.log('found=',found);
    const result:hitInfo[] = [];
    //hullA.clipAgainstHull(posA,quatA,hullB,posB,quatB,sepaxis,-100,100,result);
    quatB.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 4);
    //console.log("clipping....");
    hullA.clipAgainstHull(posA, quatA, hullB, posB, quatB, sepaxis, -100, 100, result);
    //console.log("result:",result);
    //console.log("done....");
});

test('testSepAxis', () => {
    const hullA = createBoxHull(0.5);
    const posA = new Vec3(-0.2, 0, 0);
    const quatA = new Quaternion();
    const hullB = createBoxHull();
    const posB = new Vec3(0.2, 0, 0);
    const quatB = new Quaternion();

    const sepAxis = new Vec3(1, 0, 0);
    const found1 = hullA.testSepAxis(sepAxis, hullB, posA, quatA, posB, quatB);
    expect(found1).toBe(0.6);//, 0.6, "didnt find sep axis depth");

    // Move away
    posA.x = -5;
    const found2 = hullA.testSepAxis(sepAxis, hullB, posA, quatA, posB, quatB);
    expect(found2).toBeLessThan(0);//<0表示分离, false, "found separating axis though there are none");

    // Inclined 45 degrees, what happens then?
    posA.x = 1;
    quatB.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 4);
    const found3 = hullA.testSepAxis(sepAxis, hullB, posA, quatA, posB, quatB);
    expect(typeof(found3)==='number').toBeTruthy();
});

test('findSepAxis', () => {
    const hullA = createBoxHull();
    const posA = new Vec3(-0.2, 0, 0);
    const quatA = new Quaternion();
    const hullB = createBoxHull();
    const posB = new Vec3(0.2, 0, 0);
    const quatB = new Quaternion();

    const sepaxis = new Vec3();
    const found = hullA.findSeparatingAxis(hullB, posA, quatA, posB, quatB, sepaxis,null,null);
    console.log("SepAxis found:",found,", the axis:",sepaxis.toString());

    quatB.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 4);
    const found2 = hullA.findSeparatingAxis(hullB, posA, quatA, posB, quatB, sepaxis,null,null);
    console.log("SepAxis found:",found2,", the axis:",sepaxis.toString());
});

test('project', () => {
    const convex = createBoxHull(0.5);
    const pos = new Vec3(0, 0, 0);
    const quat = new Quaternion();

    const axis = new Vec3(1, 0, 0);
    const result:number[] = [];

    ConvexPolyhedron.project(convex, axis, pos, quat, result);
    expect(result).toEqual( [0.5, -0.5]);

    axis.set(-1, 0, 0);
    ConvexPolyhedron.project(convex, axis, pos, quat, result);
    expect(result).toEqual( [0.5, -0.5]);

    axis.set(0, 1, 0);
    ConvexPolyhedron.project(convex, axis, pos, quat, result);
    expect(result).toEqual( [0.5, -0.5]);

    pos.set(0, 1, 0);
    axis.set(0, 1, 0);
    ConvexPolyhedron.project(convex, axis, pos, quat, result);
    expect(result).toEqual( [1.5, 0.5]);

    // Test to rotate
    quat.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
    pos.set(0, 1, 0);
    axis.set(0, 1, 0);
    ConvexPolyhedron.project(convex, axis, pos, quat, result);
    expect(Math.abs(result[0] - 1.5) < 0.01).toBeTruthy();
    expect(Math.abs(result[1] - 0.5) < 0.01).toBeTruthy();
});

function createPolyBox(sx:number, sy:number, sz:number) {
    const box = new Box(new Vec3(sx, sy, sz));
    return box.convexPolyhedronRepresentation;
}
