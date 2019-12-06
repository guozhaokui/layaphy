import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { addBox, addSphere, addRenderCylinder } from "./DemoUtils";
import { CannonBody } from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { RaycastVehicle } from "./objects/RaycastVehicle";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Quaternion as phyQuat } from "./math/Quaternion";
import { Quaternion } from "laya/d3/math/Quaternion";
import { WheelInfo } from "./objects/WheelInfo";
import { Handler } from "laya/utils/Handler";
import { Loader } from "laya/net/Loader";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene } from "laya/display/Scene";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;
var car:RaycastVehicle;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

/*
            var groundMaterial = new CANNON.Material("groundMaterial");
            var wheelMaterial = new CANNON.Material("wheelMaterial");
            var wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
                friction: 0.3,
                restitution: 0,
                contactEquationStiffness: 1000
            });

            // We must add the contact materials to the world
            world.addContactMaterial(wheelGroundContactMaterial);

*/

class VehicleBody extends CannonBody{
	applyPose(){
		super.applyPose();
	}
}

var wheeloffq = new phyQuat();
wheeloffq.setFromAxisAngle(new Vec3(0,0,1),Math.PI/2);
var tempQ = new phyQuat();

class CarModel{
	wheels:MeshSprite3D[]=[];
	initByPhy(car:RaycastVehicle){
		car.wheelInfos.forEach((w:WheelInfo,i:int)=>{
			let wheels = this.wheels;
			wheels[i] = addRenderCylinder(w.radius,0.2);
		})
	}
	updatePose(car:RaycastVehicle){
		for (var i = 0; i < car.wheelInfos.length; i++) {
			let wheelr = this.wheels[i];
			car.updateWheelTransform(i);
			var t = car.wheelInfos[i].worldTransform;
			let phypos = t.position;
			let phyquat = t.quaternion;
			let rtranns = wheelr.transform;
			let rpos = rtranns.position;
			let rquat = rtranns.rotation;
			rpos.setValue(phypos.x,phypos.y,phypos.z);
			rtranns.position=rpos;
			phyquat.mult(wheeloffq,tempQ);
			rquat.x=tempQ.x; rquat.y=tempQ.y; rquat.z=tempQ.z; rquat.w=tempQ.w;
			rtranns.rotation=rquat;
			/*
			var wheelBody = wheelBodies[i];
			wheelBody.position.copy(t.position);
			wheelBody.quaternion.copy(t.quaternion);
			*/
		}
	}
}

let carR = new CarModel();


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
	let p = addBox(new Vec3(10000, 100, 10000), new Vec3(0, -50, 0), 0, phymtl1);
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

function mouseDownEmitObj(scrx: number, scry: number) {
	let worlde = camctr.camera.transform.worldMatrix.elements;
	let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
	let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

	let ray = new Ray(new Vector3(), new Vector3());
	camctr.camera.viewportPointToRay(new Vector2(scrx, scry), ray);
	stpos.set(ray.origin.x, ray.origin.y, ray.origin.z);
	dir.set(ray.direction.x, ray.direction.y, ray.direction.z);

	let sp = addSphere(0.3, stpos.x, stpos.y, stpos.z);
	//let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 1, phymtl1);
	let v = 20;
	setTimeout(() => {
		sp.owner.destroy();
	}, 13000);
	sp.setVel(dir.x * v, dir.y * v, dir.z * v);
}

var wheel1:MeshSprite3D;

function createCar(){
	/*
	Sprite3D.load("res/car/car.lh",Handler.create(null,function(sprite:Sprite3D):void{
			var car = sprite;
			car.transform.position = new Vector3(0,0,0);
			sce3d.addChild(car);
	})) 
	*/
	/*
	Laya.loader.create("url",Handler.create(null,function(mesh:Mesh):void{
		var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
		var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
		meshSprite3D.meshRenderer.sharedMaterial = mat;
		meshSprite3D.getChildByName
	}),null,Loader.MESH)
	*/
	var options = {
		radius: 0.5,
		directionLocal: new Vec3(0, -1, 0),
		suspensionStiffness: 30,
		suspensionRestLength: 0.3,
		frictionSlip: 5,
		dampingRelaxation: 2.3,
		dampingCompression: 4.4,
		maxSuspensionForce: 100000,
		rollInfluence:  0.01,
		axleLocal: new Vec3(1, 0, 0),
		chassisConnectionPointLocal: new Vec3(1, 0,1),
		maxSuspensionTravel: 0.3,
		customSlidingRotationalSpeed: -30,
		useCustomSlidingRotationalSpeed: true
	};
	let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(0,10,0),150,cmtl1);
	chassisBody.phyBody.allowSleep=false;	//TODO 现在加力不能唤醒，先禁止sleep

	var car = new RaycastVehicle(chassisBody.phyBody);

	// 前轮，方向
	options.chassisConnectionPointLocal.set(-1, 0.1, -1);
	car.addWheel(options);

	options.chassisConnectionPointLocal.set(1, 0.1,-1);
	car.addWheel(options);

	// 后轮，动力
	options.chassisConnectionPointLocal.set(-1, 0.1, 1);
	car.addWheel(options);

	options.chassisConnectionPointLocal.set(1, 0.1,1);
	car.addWheel(options);	

	carR.initByPhy(car);

	//car.setMotorSpeed(111,2);
	car.addToWorld(world.world);

	world.world.addEventListener('postStep', function(){
		carR.updatePose(car);
	});	
	return car;
}

function handlKey(up:boolean,e:Event){
	var maxSteerVal = 0.5;
	var maxForce = 1000;
	var brakeForce = 1000000;

	car.setBrake(0, 0);
	car.setBrake(0, 1);
	car.setBrake(0, 2);
	car.setBrake(0, 3);	

	switch (e.keyCode) {
		case 38: // forward
			car.applyEngineForce(up ? 0 : maxForce, 2);
			car.applyEngineForce(up ? 0 : maxForce, 3);
			break;

		case 40: // backward
			car.applyEngineForce(up ? 0 : -maxForce, 2);
			car.applyEngineForce(up ? 0 : -maxForce, 3);
			break;

		case 66: // b
			if(!up){
			car.setBrake(brakeForce, 0);
			car.setBrake(brakeForce, 1);
			car.setBrake(brakeForce, 2);
			car.setBrake(brakeForce, 3);
			}
			break;

		case 39: // right
			car.setSteeringValue(up ? 0 : -maxSteerVal, 0);
			car.setSteeringValue(up ? 0 : -maxSteerVal, 1);
			break;

		case 37: // left
			car.setSteeringValue(up ? 0 : maxSteerVal, 0);
			car.setSteeringValue(up ? 0 : maxSteerVal, 1);
			break;
		default:
			break;
	}
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
		mouseDownEmitObj(e.stageX, e.stageY);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		handlKey(false,e);
	});
	Laya.stage.on(Event.KEY_UP, null, (e: Event) => {
		handlKey(true,e);
	});

	//testLift();
	//testConveyorbelt();
	//loadObj(oo,world.world);
	car = createCar();
	setInterval(() => {
		//console.log('speed=',car.speed)
	}, 10000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}