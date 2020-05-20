import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { addBox, addSphere, loadObj, mouseDownEmitObj } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { Body } from "./objects/Body";
import { RigidVehicle } from "./objects/RigidVehicle";
import { Box } from "./shapes/Box";

var oo = 
[{"name": "Cube", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.0, "y": 0.0, "z": 0.0}, "quat": {"x": 0.0, "y": 0.0, "z": -0.36059334874153137, "w": 0.9327231645584106}, "mass": 1.0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.0, "y": 0.0, "z": 2.2614493370056152}, "quat": {"x": 0.0, "y": 0.0, "z": -0.36059334874153137, "w": 0.9327231645584106}, "mass": 1.0}, {"name": "Empty", "pos": {"x": 0.0, "y": 0.0, "z": 1.1762117147445679}, "quat": {"x": -0.7088689208030701, "y": 0.0, "z": 0.0, "w": 0.7053402066230774}, "type": "C_HINGE", "A": "Cube.001", "B": "Cube"}]
;


/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;
var car:RigidVehicle;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	// phyworld
	phyworld.world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, phyworld.world);
	world.world.defaultContactMaterial.friction=0.6;
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

function rand(a: number, b: number) {
	let d = b - a;
	return Math.random() * d + a;
}

function testGround() {
	world.world.gravity.set(0, -11, 0);
	let p = addBox(new Vec3(10000, 100, 10000), new Vec3(0, -63, 0), 0, phymtl1);
	/*
	let plane = new Sprite3D();
    let planephy = plane.addComponent(CannonBody) as CannonBody;
    planephy.setMaterial(phymtl1);
    planephy.setName('plane');
    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
	planephy.setMass(0);
	*/

}

function createCar(){
	
	let chassisShape = new Box(new Vec3(5, 0.5, 6));
	let chassisBody = new Body(50, chassisShape);

	var car = new RigidVehicle(null,chassisBody);
	let pos = new Vec3(-4,0,-3);
	let axis = new Vec3(1,0,0);
	car.addWheel(null, pos, null,axis);
	car.addWheel(null, new Vec3(4,0,-3), null,axis);
	car.addWheel(null, new Vec3(0,0,9), null,axis);

	//car.setMotorSpeed(111,2);
	car.setWheelForce(122,0);
	car.setWheelForce(122,1);
	car.addToWorld(world.world);
	return car;
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	testGround();
	//createJoint();

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY,cam.camera,false,null);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		let key = String.fromCharCode(e.keyCode);
		switch (key) {
			case 'A':
				car.setSteeringValue(-30*Math.PI/180,2);
				break;
			case 'D':
				car.setSteeringValue(30*Math.PI/180,2);
				break;
			case 'W':
				car.setSteeringValue(0,2);
				car.setWheelForce(122,0);
				car.setWheelForce(122,1);
				break;
			case 'S':
				car.setWheelForce(-122,0);
				car.setWheelForce(-122,1);
				break;
			case ' ':
				car.brake(0);

				break;
			default:
				break;
		}
	});

	//testLift();
	//testConveyorbelt();
	//loadObj(oo,world.world);
	car = createCar();
	setInterval(() => {
		console.log('speed=',car.speed)
	}, 10000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}