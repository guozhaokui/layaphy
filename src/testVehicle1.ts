import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { addBox, addSphere, addRenderCylinder, loadSce, PhyObj } from "./DemoUtils";
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
import { Transform3D } from "laya/d3/core/Transform3D";
import { Transform } from "./math/Transform";

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

/*
var wheeloffq = new phyQuat();
wheeloffq.setFromAxisAngle(new Vec3(0,0,1),Math.PI/2);
*/
var tempQ = new phyQuat();

class CarModel{
	chassis:MeshSprite3D;
	chassisoffq = new phyQuat();
	chassisoffp = new Vec3();		// 车身偏移，即重心的位置取反。车身的原点在000
	wheels:MeshSprite3D[]=[];	// TODO 对于轮子可以做到不需要这个。
	wheelsOffQuat:phyQuat[]=[];
	initByPhy(car:RaycastVehicle){
		car.wheelInfos.forEach((w:WheelInfo,i:int)=>{
			let wheels = this.wheels;
			wheels[i] = addRenderCylinder(w.radius,0.2);
			this.wheelsOffQuat[i]=new phyQuat();
		})
	}
	updatePose(car:RaycastVehicle){
		if(this.chassis){
			let phypos = car.chassisBody.position;
			let phyquat = car.chassisBody.quaternion;
			let rpos = this.chassis.transform.position;
			let rquat = this.chassis.transform.rotation;
			let poff = carData.center;
			rpos.setValue(phypos.x-poff.x,phypos.y-poff.y,phypos.z-poff.z);
			this.chassis.transform.position=rpos;

			phyquat.mult(this.chassisoffq,tempQ);
			rquat.x = tempQ.x;rquat.y = tempQ.y;rquat.z = tempQ.z;rquat.w = tempQ.w;
			this.chassis.transform.rotation=rquat;
		}

		for (var i = 0; i < car.wheelInfos.length; i++) {
			let wheelr = this.wheels[i];
			let wheeloffq = this.wheelsOffQuat[i];
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

function worldtolocalTrans(wtrans:Transform3D, phypos:Vec3, phyrot:Quaternion, out:Transform3D){

}

// 车面向屏幕外面。位置是模型的全局坐标
var carData={
	/**
	 * 重心。是整个车的原点，其他的位置都根据他来算
	 * 	1. 车身物理的shape根据这个来偏移
	 *  2. 车身模型根据这个来偏移：模型原点在000，所以移动模型的时候，要减去这个
	 */
	center:new Vec3(0,0.486,0),	
	radius:0.4,
	flpos:new Vec3(0.773268, 0.406936, 1.41364),
	frpos:new Vec3(-0.773268, 0.406936, 1.41364),
	rlpos:new Vec3(0.773268, 0.406936, -1.5505),
	rrpos:new Vec3(-0.773268, 0.406936, -1.5505),
}


function createCar(){
	Sprite3D.load("res/car/car.lh",Handler.create(null,function(sprite:Sprite3D):void{
			sprite.transform.position = new Vector3(0,0,0);
			sce3d.addChild(sprite);
			let chassis = sprite.getChildByName('SM_Veh_Convertable_01') as MeshSprite3D;
			let wheelfl = sprite.getChildByName('Wheel_fl') as MeshSprite3D;
			let wheelfr = sprite.getChildByName('Wheel_fr') as MeshSprite3D;
			let wheelrl = sprite.getChildByName('Wheel_rl') as MeshSprite3D;
			let wheelrr = sprite.getChildByName('Wheel_rr') as MeshSprite3D;
			carR.chassis=chassis;
			carR.wheels[0]=wheelfl;
			carR.wheels[1]=wheelfr;
			carR.wheels[2]=wheelrl;
			carR.wheels[3]=wheelrr;

			// 计算偏移。 
			let rquat = chassis.transform.rotation;
			carR.chassisoffq.set(rquat.x,rquat.y,rquat.z,rquat.w);

			let offq = carR.wheelsOffQuat[0];
			rquat = wheelfl.transform.rotation;
			offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

			offq = carR.wheelsOffQuat[1];
			rquat = wheelfr.transform.rotation;
			offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

			offq = carR.wheelsOffQuat[2];
			rquat = wheelrl.transform.rotation;
			offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

			offq = carR.wheelsOffQuat[3];
			rquat = wheelrr.transform.rotation;
			offq.set(rquat.x,rquat.y,rquat.z,rquat.w);
	}));

	/*
	Laya.loader.create("url",Handler.create(null,function(mesh:Mesh):void{
		var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
		var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
		meshSprite3D.meshRenderer.sharedMaterial = mat;
		meshSprite3D.getChildByName
	}),null,Loader.MESH)
	*/
	var options = {
		radius: carData.radius,
		directionLocal: new Vec3(0, -1, 0),
		suspensionStiffness: 30,
		suspensionRestLength: 0.2,
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
	let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(-5,7,0),150,cmtl1);
	chassisBody.phyBody.allowSleep=false;	//TODO 现在加力不能唤醒，先禁止sleep

	var car = new RaycastVehicle(chassisBody.phyBody);

	// 前轮，方向
	carData.flpos.vsub(carData.center,options.chassisConnectionPointLocal);
	car.addWheel(options);

	carData.frpos.vsub(carData.center,options.chassisConnectionPointLocal);
	car.addWheel(options);

	// 后轮，动力
	carData.rlpos.vsub(carData.center,options.chassisConnectionPointLocal);
	car.addWheel(options);

	carData.rrpos.vsub(carData.center,options.chassisConnectionPointLocal);
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
			car.applyEngineForce(up ? 0 : -maxForce, 2);
			car.applyEngineForce(up ? 0 : -maxForce, 3);
			break;

		case 40: // backward
			car.applyEngineForce(up ? 0 : maxForce, 2);
			car.applyEngineForce(up ? 0 : maxForce, 3);
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
	let sceobj =
	[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.003", "dim": {"x": 1.2832520008087158, "y": 44.06886672973633, "z": 8.352557182312012}, "pos": {"x": 10.349227905273438, "y": -0.4336942434310913, "z": 3.357720375061035}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.006", "dim": {"x": 20.69036293029785, "y": 2.0, "z": 8.276045799255371}, "pos": {"x": 0.10714340209960938, "y": -21.061107635498047, "z": 3.2415902614593506}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.007", "dim": {"x": 21.156166076660156, "y": 2.0, "z": 22.843353271484375}, "pos": {"x": 0.7932448387145996, "y": 28.999530792236328, "z": 5.831474304199219}, "quat": {"x": -0.4526829719543457, "y": -0.0, "z": 0.0, "w": 0.8916715383529663}, "mass": 0}, {"name": "Cube.008", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.82879638671875, "y": 29.197895050048828, "z": 15.298372268676758}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.009", "dim": {"x": 0.5103281736373901, "y": 15.272051811218262, "z": 7.38112735748291}, "pos": {"x": 2.218686819076538, "y": -5.52827787399292, "z": 3.0185797214508057}, "quat": {"x": 0.0, "y": 0.0, "z": 0.17481115460395813, "w": 0.9846019744873047}, "mass": 0}, {"name": "Cube.010", "dim": {"x": 39.56965637207031, "y": 46.535789489746094, "z": 2.0}, "pos": {"x": -36.34748840332031, "y": -1.1900715827941895, "z": 0.12122726440429688}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.011", "dim": {"x": 2.0, "y": 7.9040608406066895, "z": 2.0}, "pos": {"x": -29.992624282836914, "y": -8.7035551071167, "z": 4.685491561889648}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.012", "dim": {"x": 10.628738403320312, "y": 6.746131420135498, "z": 2.0}, "pos": {"x": -11.732584953308105, "y": -10.690053939819336, "z": -0.7721989154815674}, "quat": {"x": 0.0, "y": 0.07997595518827438, "z": 0.0, "w": 0.9967967867851257}, "mass": 0}]
	loadSce(sce, phymtl2, sceobj as PhyObj[], true)


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
		console.log('speed=',car.currentVehicleSpeedKmHour,'Km/H');
	}, 5000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}