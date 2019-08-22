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
/*
export default {
    computeAABB : {
        box(test) {

        },
        boxOffset(test) {
            const quaternion = new Quaternion();
            quaternion.setFromAxisAngle(new Vec3(0,0,1), Math.PI / 2);
            const body = new Body({ mass: 1 });
            body.addShape(new Box(new Vec3(1,1,1)), new Vec3(1,1,1));
            body.computeAABB();
            test.equal(body.aabb.lowerBound.x,0);
            test.equal(body.aabb.lowerBound.y,0);
            test.equal(body.aabb.lowerBound.z,0);
            test.equal(body.aabb.upperBound.x,2);
            test.equal(body.aabb.upperBound.y,2);
            test.equal(body.aabb.upperBound.z,2);

            body.position.x = 1;
            body.computeAABB();

            test.equal(body.aabb.lowerBound.x,1);
            test.equal(body.aabb.upperBound.x,3);

            test.done();
        }
    },

    updateInertiaWorld(test) {
        const body = new Body({ mass: 1 });
        body.addShape(new Box(new Vec3(1,1,1)));
        body.quaternion.setFromEuler(Math.PI/2,0,0);
        body.updateInertiaWorld();
        test.done();
    },

    pointToLocalFrame(test) {
        const body = new Body({ mass: 1 });
        body.addShape(new Sphere(1));
        body.position.set(1,2,2);
        const localPoint = body.pointToLocalFrame(new Vec3(1,2,3));
        test.ok(localPoint.almostEquals(new Vec3(0,0,1)));
        test.done();
    },

    pointToWorldFrame(test) {
        const body = new Body({ mass: 1 });
        body.addShape(new Sphere(1));
        body.position.set(1,2,2);
        const worldPoint = body.pointToWorldFrame(new Vec3(1,0,0));
        test.ok(worldPoint.almostEquals(new Vec3(2,2,2)));
        test.done();
    },

    addShape(test) {
        const sphereShape = new Sphere(1);

        const bodyA = new Body({
            mass: 1,
            shape: sphereShape
        });
        const bodyB = new Body({
            mass: 1
        });
        bodyB.addShape(sphereShape);

        test.deepEqual(bodyA.shapes, bodyB.shapes, 'Adding shape via options did not work.');
        test.deepEqual(bodyA.inertia, bodyB.inertia);

        test.done();
    },

    applyForce(test) {
        const sphereShape = new Sphere(1);
        const body = new Body({
            mass: 1,
            shape: sphereShape
        });

        const worldPoint = new Vec3(1,0,0);
        const forceVector = new Vec3(0,1,0);
        body.applyForce(forceVector, worldPoint);
        test.deepEqual(body.force, forceVector);
        test.deepEqual(body.torque, new Vec3(0,0,1));

        test.done();
    },

    applyLocalForce(test) {
        const sphereShape = new Sphere(1);
        const body = new Body({
            mass: 1,
            shape: sphereShape
        });
        body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);

        const localPoint = new Vec3(1,0,0);
        const localForceVector = new Vec3(0,1,0);
        body.applyLocalForce(localForceVector, localPoint);
        test.ok(body.force.almostEquals(new Vec3(0,0,1))); // The force is rotated to world space

        test.done();
    },

    applyImpulse(test) {
        const sphereShape = new Sphere(1);
        const body = new Body({
            mass: 1,
            shape: sphereShape
        });

        const f = 1000;
        const dt = 1 / 60;
        const worldPoint = new Vec3(0,0,0);
        const impulse = new Vec3(f*dt,0,0);
        body.applyImpulse(impulse, worldPoint);

        test.ok(body.velocity.almostEquals(new Vec3(f*dt,0,0)));

        test.done();
    },

    applyLocalImpulse(test) {
        const sphereShape = new Sphere(1);
        const body = new Body({
            mass: 1,
            shape: sphereShape
        });
        body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);

        const f = 1000;
        const dt = 1 / 60;
        const localPoint = new Vec3(1,0,0);
        const localImpulseVector = new Vec3(0,f*dt,0);
        body.applyLocalImpulse(localImpulseVector, localPoint);
        test.ok(body.velocity.almostEquals(new Vec3(0,0,f*dt))); // The force is rotated to world space

        test.done();
    },
};
*/