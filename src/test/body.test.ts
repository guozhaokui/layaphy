import Body from "../objects/Body";
import Vec3 from "../math/Vec3";
import Sphere from "../shapes/Sphere";
import Quaternion from "../math/Quaternion";
import Box from "../shapes/Box";
import AABB from "../collision/AABB";

test('',()=>{
    const body = new Body(1);
    body.addShape(new Box(new Vec3(1,1,1)));
    body.computeAABB();
    expect(body.aabb).toEqual( new AABB(new Vec3(-1,-1,-1), new Vec3(1,1,1)));
    body.position.x=1;
    body.computeAABB();
    expect(body.aabb).toEqual( new AABB( new Vec3(0,-1,-1), new Vec3(2,1,1)));
})


test('boxOffset', () => {
    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2);
    const body = new Body(1);
    body.addShape(new Box(new Vec3(1, 1, 1)), new Vec3(1, 1, 1));
    body.computeAABB();
    expect(body.aabb).toEqual( new AABB(new Vec3(0,0,0), new Vec3(2,2,2)));
    body.position.x = 1;
    body.computeAABB();

    expect(body.aabb.lowerBound.x).toBe(1);
    expect(body.aabb.upperBound.x).toBe(3);
});

test('updateInertiaWorld', () => {
    const body = new Body(1);
    body.addShape(new Box(new Vec3(1, 1, 1)));
    body.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    body.updateInertiaWorld();
});

function Vec3Dist(v1:Vec3, v2:Vec3):f32{
    return v1.vsub(v2).length();
}
test('pointToLocalFrame', () => {
    const body = new Body(1);
    body.addShape(new Sphere(1));
    body.position.set(1, 2, 2);
    const localPoint = body.pointToLocalFrame(new Vec3(1, 2, 3));
    expect( Vec3Dist(localPoint, new Vec3(0,0,1))).toBeCloseTo(0);
});


test('pointToWorldFrame', () => {
    const body = new Body(1);
    body.addShape(new Sphere(1));
    body.position.set(1, 2, 2);
    const worldPoint = body.pointToWorldFrame(new Vec3(1, 0, 0));
    expect( Vec3Dist(worldPoint, new Vec3(2, 2, 2))).toBeCloseTo(0);
});

test('addShape', () => {
    const sphereShape = new Sphere(1);

    const bodyA = new Body(1,sphereShape);
    const bodyB = new Body(1);
    bodyB.addShape(sphereShape);// 测试addShape函数

    expect(bodyA.shapes).toEqual(bodyB.shapes);
    expect(bodyA.inertia).toEqual(bodyB.inertia);
});

test('applyForce', () => {
    const sphereShape = new Sphere(1);
    const body = new Body(1, sphereShape);

    const worldPoint = new Vec3(1, 0, 0);
    const forceVector = new Vec3(0, 1, 0);
    body.applyForce(forceVector, worldPoint);
    expect(body.force).toEqual( forceVector);
    expect(body.torque).toEqual(new Vec3(0, 0, 1));
});

test('applyLocalForce', () => {
    const sphereShape = new Sphere(1);
    const body = new Body( 1,sphereShape);
    body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);

    const localPoint = new Vec3(1, 0, 0);
    const localForceVector = new Vec3(0, 1, 0);
    body.applyLocalForce(localForceVector, localPoint);
    expect(body.force.almostEquals(new Vec3(0, 0, 1))).toBeTruthy(); // The force is rotated to world space
});

test('applyImpulse', () => {
    const sphereShape = new Sphere(1);
    const body = new Body(1,sphereShape);

    const f = 1000;
    const dt = 1 / 60;
    const worldPoint = new Vec3(0, 0, 0);
    const impulse = new Vec3(f * dt, 0, 0);
    body.applyImpulse(impulse, worldPoint);

    expect(body.velocity.almostEquals(new Vec3(f * dt, 0, 0))).toBeTruthy();
});

test('applyLocalImpulse', () => {
    const sphereShape = new Sphere(1);
    const body = new Body(1,sphereShape);
    body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);

    const f = 1000;
    const dt = 1 / 60;
    const localPoint = new Vec3(1, 0, 0);
    const localImpulseVector = new Vec3(0, f * dt, 0);
    body.applyLocalImpulse(localImpulseVector, localPoint);
    expect(body.velocity.almostEquals(new Vec3(0, 0, f * dt))).toBeTruthy(); // The force is rotated to world space
});
