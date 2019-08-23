
import World from '../world/World'
import Body from '../objects/Body';
import Vec3 from '../math/Vec3';
import Box from '../shapes/Box';
import RaycastResult from '../collision/RaycastResult';
import Sphere from '../shapes/Sphere';
import NaiveBroadphase from '../collision/NaiveBroadphase';
import ArrayCollisionMatrix from '../collision/ArrayCollisionMatrix';
import ObjectCollisionMatrix from '../collision/ObjectCollisionMatrix';

test('clearForces', () => {
    const world = new World();
    const body = new Body();
    world.addBody(body);
    body.force.set(1, 2, 3);
    body.torque.set(4, 5, 6);

    world.clearForces();

    expect(body.force.almostEquals(new Vec3(0, 0, 0))).toBeTruthy();
    expect(body.torque.almostEquals(new Vec3(0, 0, 0))).toBeTruthy();
});

test('rayTestBox', () => {
    const world = new World();

    const body = new Body();
    body.addShape(new Box(new Vec3(1, 1, 1)));
    world.addBody(body);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    const result = new RaycastResult();
    world.rayTest(from, to, result);

    expect(result.hasHit).toBeTruthy();
});

test('rayTestSphere', () => {
    const world = new World();

    const body = new Body();
    body.addShape(new Sphere(1));
    world.addBody(body);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    const result = new RaycastResult();
    world.rayTest(from, to, result);

    expect(result.hasHit).toBeTruthy();
});

test('single', () => {
    const world = new World();
    const body = new Body( 1, new Sphere(1));
    world.addBody(body);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    const result = new RaycastResult();
    world.raycastClosest(from, to, {}, result);

    expect(result.hasHit).toBeTruthy();
    expect(result.body).toEqual(body);
    expect(result.shape).toEqual(body.shapes[0]);

});

test('order', () => {
    const world = new World();
    const bodyA = new Body(1,  new Sphere(1), new Vec3(-1, 0, 0));
    const bodyB = new Body(1, new Sphere(1),  new Vec3(1, 0, 0) );
    world.addBody(bodyA);
    world.addBody(bodyB);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    let result = new RaycastResult();
    world.raycastClosest(from, to, {}, result);

    expect(result.hasHit).toBeTruthy();
    expect(result.body).toEqual(bodyA);
    expect(result.shape).toEqual(bodyA.shapes[0]);

    from.set(10, 0, 0);
    to.set(-10, 0, 0);

    result = new RaycastResult();
    world.raycastClosest(from, to, {}, result);

    expect(result.hasHit).toBeTruthy();
    expect(result.body).toEqual(bodyB);
    expect(result.shape).toEqual(bodyB.shapes[0]);

});

test('simple', () => {
    const world = new World();
    const body = new Body(1, new Sphere(1) );
    world.addBody(body);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    let hasHit;
    let numResults = 0;
    let resultBody:Body|null=new Body();
    let resultShape;

    const returnVal = world.raycastAll(from, to, {}, result => {
        hasHit = result.hasHit;
        resultShape = result.shape;
        resultBody = result.body;
        numResults++;
    });

    expect(returnVal).toBeTruthy();//, true, 'should return true on hit');
    expect(hasHit).toBeTruthy();//, true);
    expect(resultBody).toEqual(body);
    expect(numResults).toBe(2);
    expect(resultShape).toEqual(resultBody.shapes[0]);
});

test('twoSpheres', () => {
    const world = new World();
    const body = new Body(1, new Sphere(1) );
    world.addBody(body);

    const body2 = new Body(1, new Sphere(1) );
    world.addBody(body2);

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    let hasHit = false;
    let numResults = 0;

    world.raycastAll(from, to, {}, result => {
        hasHit = result.hasHit;
        //let resultShape = result.shape;
        //let resultBody = result.body;
        numResults++;
    });

    expect(hasHit).toBeTruthy();
    expect(numResults).toBe(4);
});

test('skipBackFaces', () => {
    const world = new World();
    const body = new Body( 1, new Sphere(1) );
    world.addBody(body);

    let hasHit = false;
    let numResults = 0;

    world.raycastAll(new Vec3(-10, 0, 0), new Vec3(10, 0, 0), { skipBackfaces: true }, result => {
        hasHit = result.hasHit;
        //let resultShape = result.shape;
        //let resultBody = result.body;
        numResults++;
    });

    expect(hasHit).toBeTruthy();
    expect(numResults).toBe(1);
});

test('collisionFilters', () => {
    const world = new World();
    const body = new Body(1, new Sphere(1));
    world.addBody(body);
    body.collisionFilterGroup = 2;
    body.collisionFilterMask = 2;

    let numResults = 0;

    world.raycastAll(new Vec3(-10, 0, 0), new Vec3(10, 0, 0), {
        collisionFilterGroup: 2,
        collisionFilterMask: 2
    }, result => {
        numResults++;
    });

    expect(numResults).toBe(2);

    numResults = 0;

    world.raycastAll(new Vec3(-10, 0, 0), new Vec3(10, 0, 0), {
        collisionFilterGroup: 1,
        collisionFilterMask: 1
    }, result => {
        numResults++;
    });

    expect(numResults).toBe(0);//, 0, 'should use collision groups!');

});

test('raycastAny', () => {
    const world = new World();
    world.addBody(new Body(1, new Sphere(1)));

    const from = new Vec3(-10, 0, 0);
    const to = new Vec3(10, 0, 0);

    const result = new RaycastResult();
    world.raycastAny(from, to, {}, result);

    expect(result.hasHit).toBeTruthy();;

});

test('collisionMatrix', () => {
    function testCollisionMatrix(CollisionMatrix:typeof ArrayCollisionMatrix|typeof ObjectCollisionMatrix) {
        const test_configs:{positions:number[][],colliding:{[key:string]:boolean}}[] = [
            {
                positions: [
                    [0, 0, 0],
                    [2, 0, 0],
                    [0, 4, 0],
                    [2, 4, 0],
                    [0, 8, 0],
                    [2, 8, 0]
                ],
                colliding: {
                    '0-1': true,
                    '2-3': true,
                    '4-5': true
                }
            },
            {
                positions: [
                    [0, 0, 0],
                    [0, 4, 0],
                    [0, 8, 0],
                    [2, 0, 0],
                    [2, 4, 0],
                    [2, 8, 0]
                ],
                colliding: {
                    '0-3': true,
                    '1-4': true,
                    '2-5': true
                }
            },
            {
                positions: [
                    [0, 0, 0],
                    [0, 1, 0],
                    [0, 10, 0],
                    [0, 20, 0],
                    [0, 30, 0],
                    [0, 40, 0],
                    [0, 50, 0],
                    [0, 51, 0]
                ],
                colliding: {
                    '0-1': true,
                    '6-7': true
                }
            }
        ];

        for (let config_idx = 0; config_idx < test_configs.length; config_idx++) {
            const test_config = test_configs[config_idx];

            const world = new World();
            world.broadphase = new NaiveBroadphase();
            world.collisionMatrix = new (CollisionMatrix as typeof ArrayCollisionMatrix)();
            world.collisionMatrixPrevious = new (CollisionMatrix as typeof ArrayCollisionMatrix)();

            for (let position_idx = 0; position_idx < test_config.positions.length; position_idx++) {
                const body = new Body(1);
                body.addShape(new Sphere(1.1));
                let v = test_config.positions[position_idx];
                body.position.set(v[0], v[1], v[2]);
                world.addBody(body);
            }

            for (let step_idx = 0; step_idx < 2; step_idx++) {
                world.step(0.1);
                const is_first_step = (step_idx === 0);

                for (let coll_i = 0; coll_i < world.bodies.length; coll_i++) {
                    for (let coll_j = coll_i + 1; coll_j < world.bodies.length; coll_j++) {
                        const is_colliding_pair = test_config.colliding[`${coll_i}-${coll_j}`] === true;
                        const expected = is_colliding_pair;
                        const is_colliding = is_first_step ?
                            !!world.collisionMatrix.get(world.bodies[coll_i], world.bodies[coll_j]) :
                            !!world.collisionMatrixPrevious.get(world.bodies[coll_i], world.bodies[coll_j]);
                        expect(is_colliding === expected).toBeTruthy();//,
                        //`${expected ? "Should be colliding" : "Should not be colliding"}: cfg=${config_idx} is_first_step=${is_first_step} is_colliding_pair=${is_colliding_pair} expected=${expected} is_colliding=${is_colliding} i=${coll_i} j=${coll_j}`);
                    }
                }
            }
        }
    }

    testCollisionMatrix(ArrayCollisionMatrix);
    testCollisionMatrix(ObjectCollisionMatrix);
});
