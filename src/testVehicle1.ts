import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Ease } from "laya/utils/Ease";
import { Handler } from "laya/utils/Handler";
import { Tween } from "laya/utils/Tween";
import { addBox, addSphere, loadSce, PhyObj } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion as phyQuat } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Body } from "./objects/Body";
import { RaycastVehicle } from "./objects/RaycastVehicle";
import { Box } from "./shapes/Box";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;

let phymtl1 = new Material("1",1,0);
let phymtl2 = new Material('2',0,0);
let phymtl3 = new Material('3',1,0);
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

class Dashboard extends Sprite{
	speed=0;
	force=0;
}

/*
var wheeloffq = new phyQuat();
wheeloffq.setFromAxisAngle(new Vec3(0,0,1),Math.PI/2);
*/
var tempQ = new phyQuat();
var lastTarget=new Vec3();

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	// phyworld
	phyworld.world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, phyworld.world);
	world.world.defaultContactMaterial.friction=0.6;
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
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
	sp.setMass(100);
	//let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 1, phymtl1);
	let v = 20;
	setTimeout(() => {
		sp.owner.destroy();
	}, 13000);
	sp.setVel(dir.x * v, dir.y * v, dir.z * v);
}


// 车面向屏幕外面。位置是模型的全局坐标
var carData={
	modelUrl:'res/car/car.lh',
	chassisNode:'SM_Veh_Convertable_01',
	wheelflNode:'Wheel_fl',
	wheelfrNode:'Wheel_fr',
	wheelrlNode:'Wheel_rl',
	wheelrrNode:'Wheel_rr',
	/**
	 * 重心。是整个车的原点，其他的位置都根据他来算
	 * 	1. 车身物理的shape根据这个来偏移
	 *  2. 车身模型根据这个来偏移：模型原点在000，所以移动模型的时候，要减去这个
	 */
	center:new Vec3(0,0.01,0),	
	chassisBox:new Vec3(2/2,0.791/2,4.68/2),	//
	chassisBoxPos:new Vec3(0.00716, 0.570108, -0.170404),	// 这是相对原点的，需要根据center转换
	mass:1500,
	单轮拉力:10000,
	脚刹力:10000,
	手刹力:100,
	radius:0.4,
	悬挂平时长度:0.2,
	悬挂最大移动范围:0.3,		// 在正负v之间
	悬挂提供的最大力:100000,		// 支撑底盘
	悬挂硬度:30,					// 弹性系数
	悬挂压缩阻尼:4.4,				// 阻尼系数，阻止车的震动的能力
	悬挂放松阻尼:2.3,
	侧滑翻滚系数:0.01,			// 0的时候，侧滑力会施加到中心，不易翻滚，1的时候，侧滑力施加在轮胎接触点，基本上一拐弯就翻车
	滑动时轮胎转速:-30,			// 弧度/秒 ？	
	开启滑动时轮胎转速:true,
	轮胎静摩擦系数:5,			// 悬挂力*这个系数决定了抓地能力。受力超过这个限制就开始打滑
	最大速度:200,				// km/h
	flpos:new Vec3(0.773268, 0.406936, 1.41364),	// 相对原点的
	frpos:new Vec3(-0.773268, 0.406936, 1.41364),
	rlpos:new Vec3(0.773268, 0.406936, -1.5505),
	rrpos:new Vec3(-0.773268, 0.406936, -1.5505),
}


	/*
	Laya.loader.create("url",Handler.create(null,function(mesh:Mesh):void{
		var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
		var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
		meshSprite3D.meshRenderer.sharedMaterial = mat;
		meshSprite3D.getChildByName
	}),null,Loader.MESH)
	*/


class Car{
	private static tmpV1:Vec3=new Vec3();

	carData:typeof carData;

	// 车身
	chassis:MeshSprite3D;
	chassisoffq = new phyQuat();
	chassisoffp = new Vec3();		// 车身偏移，即重心的位置取反。车身的原点在000

	// 轮胎
	wheels:MeshSprite3D[]=[];	// TODO 对于轮子可以做到不需要这个。
	wheelsOffQuat:phyQuat[]=[];

	// 调试轨迹
	wheelstrackf:Vec3[]=[];	// 前轮
	wheelstrackr:Vec3[]=[];	// 后轮
	wheelstrackslid:Vec3[]=[];	// 侧滑
	tracklen=1000;

	// 刹车tween
	wheelBrake:Tween[]=[];
	isBraking=false;

	phyCar:RaycastVehicle;

	constructor(){
	}

	parse(data:typeof carData){
		this.carData=data;
		// 加载渲染对象
		Sprite3D.load(data.modelUrl,Handler.create(this,this.onModelLoaded));

		// 创建物理对象
		var options = {
			radius: carData.radius,
			directionLocal: new Vec3(0, -1, 0),
			suspensionStiffness: carData.悬挂硬度,
			suspensionRestLength: carData.悬挂平时长度,
			frictionSlip: carData.轮胎静摩擦系数,
			dampingRelaxation: carData.悬挂放松阻尼,
			dampingCompression: carData.悬挂压缩阻尼,
			maxSuspensionForce: carData.悬挂提供的最大力,
			rollInfluence:  carData.侧滑翻滚系数,
			axleLocal: new Vec3(1, 0, 0),
			chassisConnectionPointLocal: new Vec3(1, 0,1),
			maxSuspensionTravel: carData.悬挂最大移动范围,
			customSlidingRotationalSpeed: carData.滑动时轮胎转速,
			useCustomSlidingRotationalSpeed: true,
			isFrontWheel:true
		};
		//let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(-5,7,0),carData.mass,cmtl1);
		let chassisBody = new Body(data.mass);
		let chassisOff = new Vec3();
		carData.chassisBoxPos.vsub(carData.center,chassisOff);
		chassisBody.addShape(new Box(carData.chassisBox), chassisOff);
		chassisBody.allowSleep=false;	//TODO 现在加力不能唤醒，先禁止sleep
		chassisBody.position.copy(carData.center);
	
		var car = this.phyCar = new RaycastVehicle(chassisBody);
		car.maxSpeed=carData.最大速度;
	
		// 前轮，方向
		options.isFrontWheel=true;
		carData.flpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		carData.frpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		// 后轮，动力
		options.isFrontWheel=false;
		carData.rlpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		carData.rrpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);	
	
		this.wheelsOffQuat=[new phyQuat(), new phyQuat(), new phyQuat(), new phyQuat()];
		this.wheelBrake.length = car.wheelInfos.length;		

		car.addToWorld(world.world);
	
		world.world.addEventListener('postStep', ()=>{
			this.updatePose();
		});	
	}

	onModelLoaded(model:Sprite3D){
		sce3d.addChild(model);	//TODO

		let dt = this.carData;
		let chassis = model.getChildByName( dt.chassisNode ) as MeshSprite3D;
		let wheelfl = model.getChildByName( dt.wheelflNode ) as MeshSprite3D;
		let wheelfr = model.getChildByName( dt.wheelfrNode ) as MeshSprite3D;
		let wheelrl = model.getChildByName( dt.wheelrlNode ) as MeshSprite3D;
		let wheelrr = model.getChildByName( dt.wheelrrNode ) as MeshSprite3D;
		this.chassis=chassis;
		this.wheels[0]=wheelfl;
		this.wheels[1]=wheelfr;
		this.wheels[2]=wheelrl;
		this.wheels[3]=wheelrr;

		// 计算偏移。 
		let rquat = chassis.transform.rotation;
		this.chassisoffq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		let offq = this.wheelsOffQuat[0];
		rquat = wheelfl.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[1];
		rquat = wheelfr.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[2];
		rquat = wheelrl.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[3];
		rquat = wheelrr.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);
	}

	enable(){
	}

	// 加油前进
	accel(k:number){
		let maxForce = this.carData.单轮拉力;
		this.phyCar.applyEngineForce(-maxForce*k, 2);
		this.phyCar.applyEngineForce(-maxForce*k, 3);
	}

	// 后退
	reversing(k:number){
		let maxForce = this.carData.单轮拉力;
		this.phyCar.applyEngineForce(maxForce*k, 2);
		this.phyCar.applyEngineForce(maxForce*k, 3);
	}

	// 方向盘。v=0是直行。单位是弧度
	steer(v:number){
		this.phyCar.setSteeringValue(v, 0);
		this.phyCar.setSteeringValue(v, 1);
	}

	// 手刹
	handbrake(f:number|null){
		if(f==null||f==undefined){
			f=this.carData.手刹力;
		}
		this.phyCar.setBrake(f, 2);
		this.phyCar.setBrake(f, 3);
	}

	// 刹车
	brake(b:boolean){
		if(b==this.isBraking)
			return;
		this.isBraking=b;
		let phy = this.phyCar;
		let n = this.wheelBrake.length;
		for(let i=0; i<n; i++){
			let tn = this.wheelBrake[i];
			if(tn){
				 tn.clear();
			}else{
				tn = this.wheelBrake[i] = new Tween();	
			}
		}

		if(b){
			let force = carData.脚刹力;
			for(let i=0; i<n; i++){
				let tn = this.wheelBrake[i];
				tn.to(phy.wheelInfos[i], {brake:force},2000,Ease.linearInOut);
			}
		}else{
			phy.setBrake(0,0);		
			phy.setBrake(0,1);
			phy.setBrake(0,2);
			phy.setBrake(0,3);
		}
	}

	updatePose(){
		let car = this.phyCar;
		if(this.chassis){
			let phypos = car.chassisBody.position;
			let phyquat = car.chassisBody.quaternion;
			let rpos = this.chassis.transform.position;
			let rquat = this.chassis.transform.rotation;
			let poff = carData.center;
			var npoff = Car.tmpV1;
			phyquat.vmult(poff,npoff)
			rpos.setValue(phypos.x-npoff.x,phypos.y-npoff.y,phypos.z-npoff.z);
			this.chassis.transform.position=rpos;

			phyquat.mult(this.chassisoffq,tempQ);
			rquat.x = tempQ.x;rquat.y = tempQ.y;rquat.z = tempQ.z;rquat.w = tempQ.w;
			this.chassis.transform.rotation=rquat;

			// 控制摄像机
			lastTarget.vadd(phypos,lastTarget);
			lastTarget.scale(0.5,lastTarget);
			camctr.target.setValue(lastTarget.x,lastTarget.y,lastTarget.z);
			camctr.updateCam(true);
		}

		for (var i = 0; i < car.wheelInfos.length; i++) {
			let wheelr = this.wheels[i];
			if(!wheelr)
				continue;
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

			let wheelinfo = car.wheelInfos[i];
			if(wheelinfo.sliding){
				this.wheelstrackslid.push(wheelinfo.raycastResult.hitPointWorld.clone());
				if(this.wheelstrackslid.length>this.tracklen){
					this.wheelstrackslid.shift();
				}
			}else{
				if(wheelinfo.isInContact){
					if(wheelinfo.isFrontWheel){
						this.wheelstrackf.push(wheelinfo.raycastResult.hitPointWorld.clone());
						if(this.wheelstrackf.length>this.tracklen){
							this.wheelstrackf.shift();
						}
					}else{
						this.wheelstrackr.push(wheelinfo.raycastResult.hitPointWorld.clone());
						if(this.wheelstrackr.length>this.tracklen){
							this.wheelstrackr.shift();
						}
					}
				}
			}
			/*
			var wheelBody = wheelBodies[i];
			wheelBody.position.copy(t.position);
			wheelBody.quaternion.copy(t.quaternion);
			*/
		}

		let phyr = world.world.phyRender;
		this.wheelstrackf.forEach((v:Vec3)=>{
			phyr.addVec(v.x,v.y,v.z,0,.1,0,0xff6666);
		});
		this.wheelstrackr.forEach((v:Vec3)=>{
			phyr.addVec(v.x,v.y,v.z,0,.1,0,0x66ff66);
		});
		this.wheelstrackslid.forEach((v)=>{
			phyr.addVec(v.x,v.y,v.z,0,.2,0,0x000000);
		});
		phyr.addPoint1(this.phyCar.chassisBody.position, 0xff0000)
	}

	op_steerLeft=false;
	op_steerRight=false;
	op_acc=false;
	op_rev=false;
	op_handbrake=false;
	op_brake=false;

	onkeyEvent(e:Event,down:boolean){
		switch (e.keyCode) {
			case 38: // forward
				this.op_acc=down;
				break;
			case 40: // backward
				this.op_rev=down;
				break;
	
			case 66: // b
				this.op_brake=down;
				break;
	
			case 'V'.charCodeAt(0):
				this.op_handbrake=down;
				break;
			case 39: // right
				this.op_steerRight=down;
				break;
	
			case 37: // left
				this.op_steerLeft=down;
				break;
			case 'R'.charCodeAt(0):
				this.phyCar.chassisBody.quaternion.set(0,0,0,1);
				break;
			case ' '.charCodeAt(0):
				/*
				car.wheelInfos[0].frictionSlip=0.01;
				car.wheelInfos[1].frictionSlip=0.01;
				car.wheelInfos[2].frictionSlip=0.01;
				car.wheelInfos[3].frictionSlip=0.01;
				*/
				break;
			default:
				break;
		}
		this.updateCtrl();
	}

	updateCtrl(){
		var maxSteerVal = 0.5;
		if(this.op_steerLeft){
			this.steer(maxSteerVal);
		}else if(this.op_steerRight){
			this.steer(-maxSteerVal);
		}else{
			this.steer(0);
		}

		if(this.op_acc){
			this.accel(1);
		}else if(this.op_rev){
			this.reversing(1);
		}else{
			this.accel(0);
		}

		if(this.op_brake){
			this.brake(true)
		}else if(this.op_handbrake){
			this.handbrake(null);
		}else{
			this.brake(false);
		}
	}
}

let car1 = new Car();
	
export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	let sceobj =
	[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.007", "dim": {"x": 21.156166076660156, "y": 2.0, "z": 22.843351364135742}, "pos": {"x": 0.7932448387145996, "y": 29.810110092163086, "z": 1.923642873764038}, "quat": {"x": -0.6076875925064087, "y": -2.8394364189311764e-17, "z": -1.2932333602556147e-17, "w": 0.7941761612892151}, "mass": 0}, {"name": "Cube.010", "dim": {"x": 39.56965637207031, "y": 46.535789489746094, "z": 2.0}, "pos": {"x": -36.34748840332031, "y": -1.1900715827941895, "z": 0.12122726440429688}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.011", "dim": {"x": 2.0, "y": 7.904061317443848, "z": 2.0}, "pos": {"x": -28.82550811767578, "y": 20.522964477539062, "z": 5.052074909210205}, "quat": {"x": -0.7062811851501465, "y": -0.0, "z": 0.0, "w": 0.7079314589500427}, "mass": 0}, {"name": "Cube.012", "dim": {"x": 10.628738403320312, "y": 6.746131420135498, "z": 2.0}, "pos": {"x": -11.732584953308105, "y": -10.690053939819336, "z": -0.7721989154815674}, "quat": {"x": 0.0, "y": 0.07997595518827438, "z": 0.0, "w": 0.9967967867851257}, "mass": 0}, {"name": "Cube.013", "dim": {"x": 21.156166076660156, "y": 2.000000238418579, "z": 22.843355178833008}, "pos": {"x": 0.7932448387145996, "y": 50.98167037963867, "z": 4.678845405578613}, "quat": {"x": -0.7063905000686646, "y": -5.2919352835390326e-17, "z": -2.6763240121973548e-17, "w": 0.7078224420547485}, "mass": 0}, {"name": "Cube.014", "dim": {"x": 21.156166076660156, "y": 2.000000238418579, "z": 22.84335708618164}, "pos": {"x": 0.7932448387145996, "y": 72.1532211303711, "z": 1.0535789728164673}, "quat": {"x": -0.8072583079338074, "y": -8.069866853459951e-17, "z": -4.249768775422248e-17, "w": 0.5901987552642822}, "mass": 0}]
	loadSce(sce, phymtl2, sceobj as PhyObj[], true)

	testGround();
	//createJoint();
	car1.parse(carData);
	car1.enable();
	

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		car1.onkeyEvent(e,true);
	});

	Laya.stage.on(Event.KEY_UP, null, (e: Event) => {
		car1.onkeyEvent(e,false);
	});

	//testLift();
	//testConveyorbelt();
	//loadObj(oo,world.world);
	setInterval(() => {
		console.log('speed=',car1.phyCar.currentVehicleSpeedKmHour,'Km/H');
	}, 1000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}