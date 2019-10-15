import {RaycastVehicle} from "../objects/RaycastVehicle";
import {Body} from "../objects/Body";
import {Vec3} from "../math/Vec3";
import {World} from "../world/World";
import {Plane} from "../shapes/Plane";

test('construct',()=>{
    new RaycastVehicle( new Body());
});

test('addWheel',()=>{
    const vehicle = new RaycastVehicle(new Body());
    vehicle.addWheel({});
    expect(vehicle.wheelInfos.length).toBe( 1);
});

test('addWheel',()=>{
    const vehicle = new RaycastVehicle( new Body());
    vehicle.addWheel({});
    expect(vehicle.wheelInfos.length).toBe(1);
    vehicle.addWheel({});
    expect(vehicle.wheelInfos.length).toBe(2);
});

test('setSteeringValue',()=>{
    const vehicle = createVehicle();
    vehicle.setSteeringValue(Math.PI / 4, 0);
});

test('applyEngineForce',()=>{
    const vehicle = createVehicle();
    vehicle.applyEngineForce(1000, 0);
});

test('setBrake',()=>{
    const vehicle = createVehicle();
    vehicle.applyEngineForce(1000, 0);
});

test('updateSuspension',()=>{
    const vehicle = createVehicle();
    vehicle.updateSuspension(1 / 60);
});

test('updateFriction',()=>{
    const vehicle = createVehicle();
    vehicle.updateFriction(1 / 60);
});

test('updateWheelTransform',()=>{
    const vehicle = createVehicle();
    vehicle.updateWheelTransform(0);
});

test('updateVehicle',()=>{
    const vehicle = createVehicle();
    vehicle.updateVehicle(1 / 60);
});

test('getVehicleAxisWorld',()=>{
    const vehicle = createVehicle();
    const v = new Vec3();

    vehicle.getVehicleAxisWorld(0, v);
    expect(v).toEqual( new Vec3(1, 0, 0));

    vehicle.getVehicleAxisWorld(1, v);
    expect(v).toEqual(new Vec3(0, 1, 0));

    vehicle.getVehicleAxisWorld(2, v);
    expect(v).toEqual(new Vec3(0, 0, 1));
});

test('removeFromWorld',()=>{
    const world = new World();
    const vehicle = new RaycastVehicle(new Body(1));

    vehicle.addToWorld(world);
    expect(world.bodies.includes(vehicle.chassisBody)).toBeTruthy();
    expect(world.hasEventListener('preStep', vehicle.preStepCallback)).toBeTruthy();

    vehicle.removeFromWorld(world);
    expect(!world.bodies.includes(vehicle.chassisBody)).toBeTruthy();
    expect(!world.hasEventListener('preStep', vehicle.preStepCallback)).toBeTruthy();
});


function createVehicle() {
    const vehicle = new RaycastVehicle(new Body(1));
    const down = new Vec3(0, 0, -1);
    const info = {
        chassisConnectionPointLocal: new Vec3(-5, -1 / 2, 0),
        axleLocal: new Vec3(0, -1, 0),
        directionLocal: down,
        suspensionStiffness: 1000,
        suspensionRestLength: 2,
    };
    vehicle.addWheel(info);

    const world = new World();
    const planeBody = new Body();
    planeBody.position.z = -1;
    planeBody.addShape(new Plane());
    world.addBody(planeBody);

    vehicle.addToWorld(world);

    return vehicle;
}