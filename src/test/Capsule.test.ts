import {Quaternion} from "../math/Quaternion";
import {Vec3} from "../math/Vec3";
import {Capsule} from "../shapes/Capsule";

test('construct',()=>{
    const cap =new Capsule(1,2);
    expect(cap.axis.almostEquals(new Vec3(0,0,1))).toBeTruthy();

    let q = new Quaternion();
    q.setFromAxisAngle(new Vec3(1,0,0), Math.PI/2);// 逆时针旋转90度
    cap.calcDir(q);
    expect(cap.axis.almostEquals(new Vec3(0,-1,0))).toBeTruthy();
});

test('construct1',()=>{
    const cap =new Capsule(0.2,1);
    expect(cap.axis.almostEquals(new Vec3(0,0,0.5))).toBeTruthy();

    let q = new Quaternion();
    q.setFromAxisAngle(new Vec3(1,0,0), -Math.PI/2);// 顺时针旋转90度
    cap.calcDir(q);
    expect(cap.axis.almostEquals(new Vec3(0,0.5,0))).toBeTruthy();

    q.setFromAxisAngle(new Vec3(1,0,0), -Math.PI/4);
    cap.calcDir(q);
    expect(cap.axis.almostEquals(new Vec3(0, 0.3535533905932738, 0.35355339059327373 ))).toBeTruthy();

});

test('aabb',()=>{
    const cap =new Capsule(1,2);
    //cap.calcDir()
    let capPos = new Vec3();
    let q = new Quaternion();
    let min=new Vec3();
    let max=new Vec3();
    cap.calculateWorldAABB(capPos,q,min,max);
    expect(min.almostEquals(new Vec3(-1,-1,-2))).toBeTruthy();
    expect(max.almostEquals(new Vec3(1,1,2))).toBeTruthy();

});

test('hit1',()=>{
    const cap =new Capsule(1,2);
    let q = new Quaternion();
    cap.calcDir(q);
    let hit = new Vec3();
    let capPos = new Vec3();
    //正好接触
    let planePos = new Vec3(0,0,-2);
    let planeNorm = new Vec3(0,0,1);
    let deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(0);

    //
    planePos.z=-1;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(1);

    //平面上移3
    planePos.z=3;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(5);

    // 胶囊放倒
    q.setFromAxisAngle(new Vec3(1,0,0),Math.PI/2);
    cap.calcDir(q);
    planePos.z=-1;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(0);
    expect(hit.almostEquals(new Vec3(0,0,-1))).toBeTruthy();
});


test('hit2',()=>{
    const cap =new Capsule(1,2);
    let q = new Quaternion();
    let hit = new Vec3();
    let capPos = new Vec3();
    let planePos = new Vec3(0,0,-2);
    let planeNorm = new Vec3(0,0,1);
    let deep=0;

    q.setFromAxisAngle(new Vec3(1,0,0),Math.PI/4);
    cap.calcDir(q);
    planePos.z=-1;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    console.log(hit);
    console.log(deep);    
    expect(deep).toBeCloseTo(0.7071067811865475);
    expect(hit.almostEquals(new Vec3( 0, 0.7071067811865476,-1.7071067811865475))).toBeTruthy();
});
