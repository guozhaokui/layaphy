import Quaternion from "../math/Quaternion";
import Vec3 from "../math/Vec3";
import Box from "../shapes/Box";

test('forEachWOrldCorner', () => {
    const box = new Box(new Vec3(1, 1, 1));
    const pos = new Vec3();
    const quat = new Quaternion();
    quat.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI * 0.25);
    let numCorners = 0;
    const unique:Vec3[] = [];
    box.forEachWorldCorner(pos, quat, (x, y, z) => {
        const corner = new Vec3(x, y, z);
        for (let i = 0; i < unique.length; i++) {
            expect(!corner.almostEquals(unique[i])).toBeTruthy();//, `Corners ${i} and ${numCorners} are almost equal: (${unique[i].toString()}) == (${corner.toString()})`);
        }
        unique.push(corner);
        numCorners++;
    });
    expect(numCorners).toBe(8);
});

test('calculateWorldAABB', () => {
    const box = new Box(new Vec3(1, 1, 1));
    const min = new Vec3();
    const max = new Vec3();
    box.calculateWorldAABB(new Vec3(3, 0, 0),
        new Quaternion(0, 0, 0, 1),
        min,
        max);
    expect(min.x).toBe(2);
    expect(max.x).toBe( 4);
    expect(min.y).toBe( -1);
    expect(max.y).toBe( 1);
});

test('calculateWorldAABB1', () => {
    const box = new Box(new Vec3(1, 1, 1));
    const min = new Vec3();
    const max = new Vec3();
    let pos = new Vec3(3,0,0);
    let q = new Quaternion(0,0,0,1);
    q.setFromAxisAngle(new Vec3(0,0,1), Math.PI/4);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.585786437626905, -1.414213562373095, -1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.414213562373095, 1.414213562373095, 1))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(0,0,1), -Math.PI/4);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.585786437626905, -1.414213562373095, -1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.414213562373095, 1.414213562373095, 1))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(0,0,1), Math.PI*3/4);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.585786437626905, -1.414213562373095, -1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.414213562373095, 1.414213562373095, 1))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(0,0,1), -Math.PI*3/4);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.585786437626905, -1.414213562373095, -1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.414213562373095, 1.414213562373095, 1))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(0,0,1), -Math.PI/2);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(2,-1,-1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4,1, 1))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(0,0,1), Math.PI);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(2,-1,-1))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4,1, 1))).toBeTruthy();

    let axis = new Vec3(1,1,1);
    axis.normalize();
    q.setFromAxisAngle(axis, Math.PI*0.33);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.3334064408459838,-1.6665935591540162,-1.6665935591540162))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.666593559154016,1.6665935591540162,1.6665935591540162))).toBeTruthy();
   
    q.setFromAxisAngle(axis, Math.PI*1.33);
    box.calculateWorldAABB(pos,q, min,max);
    expect( min.almostEquals(new Vec3(1.9879447789995046,-1.0120552210004954,-1.0120552210004954))).toBeTruthy();
    expect( max.almostEquals(new Vec3(4.012055221000495,1.0120552210004954, 1.0120552210004954))).toBeTruthy();
});

test('calculateWorldAABB2', () => {
    let min = new Vec3();
	let max = new Vec3();
	let min1 = new Vec3();
	let max1 = new Vec3();
	let pos = new Vec3(0,0,0);
	let q = new Quaternion(0,0,0,1);
	let scale = new Vec3(1,1,1);
	Box.calculateWorldAABB1(pos,q,scale, new Vec3(-1,-1,-1), new Vec3(1,1,1),min,max);

    expect( min.almostEquals(new Vec3(-1,-1,-1))).toBeTruthy();
	expect( max.almostEquals(new Vec3(1,1,1))).toBeTruthy();
	
	scale.set(2,3,4);
	Box.calculateWorldAABB1(pos,q,scale, new Vec3(-1,-1,-1), new Vec3(1,1,1),min,max);
    expect( min.almostEquals(new Vec3(-2,-3,-4))).toBeTruthy();
	expect( max.almostEquals(new Vec3(2,3,4))).toBeTruthy();

	scale.set(1,1,1);
	q.setFromAxisAngle(new Vec3(0,0,1), Math.PI/4);
	Box.calculateWorldAABB11(pos,q,scale,new Vec3(-1,-1,-1),new Vec3(1,1,1), min, max);
	Box.calculateWorldAABB1(pos,q,scale,new Vec3(-1,-1,-1),new Vec3(1,1,1), min1, max1);
	expect(min.almostEquals(min1)).toBeTruthy();
	expect(max.almostEquals(max1)).toBeTruthy();

	pos.set(1,1,1);
	scale.set(1,2,3);
	let axis = new Vec3(0,1,1);
	axis.normalize();
	q.setFromAxisAngle(axis, Math.PI/4);
	Box.calculateWorldAABB11(pos,q,scale,new Vec3(-1,-1,-1),new Vec3(1,1,1), min, max);
	Box.calculateWorldAABB1(pos,q,scale,new Vec3(-1,-1,-1),new Vec3(1,1,1), min1, max1);
	expect(min.almostEquals(min1)).toBeTruthy();
	expect(max.almostEquals(max1)).toBeTruthy();
});