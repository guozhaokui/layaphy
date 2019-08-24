import Quaternion from "../math/Quaternion";
import Vec3 from "../math/Vec3";
import Capsule from "../shapes/Capsule";

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
    let planePos = new Vec3(0,0,-2);
    let planeNorm = new Vec3(0,0,1);
    let deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(0);

    planePos.z=-1;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(1);

    planePos.z=3;
    deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    expect(deep).toBeCloseTo(5);

    console.log(deep);    
});
