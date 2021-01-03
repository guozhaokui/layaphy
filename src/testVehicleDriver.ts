import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { addBox, mouseDownEmitObj } from "./DemoUtils";
import { delay } from "./layawrap/Async";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender, UIPlane } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion as phyQuat } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Car, carData } from "./objects/Car";


var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;

let phymtl1 = new Material("1",1,0);
let phymtl2 = new Material('2',1,0);
let phymtl3 = new Material('3',1,0);
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


/**
 * 输入参数
 * 	角度差 -左边  +右边
 *  距离差 -左边， +右边
 *  速度值
 * 动作
 * 	油门:-1,1
 *  方向盘:-1,1
 * 
 * 	左右对称
 * 
 * 评价
 * 	1. 达到目标的时间，稳定性
 *  2. 一段时间之后再评估，看是否在目标上了，或者正确执行了几次 
 */

let car1:Car;

	
export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 10;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	testGround();

	//createJoint();
	let kmhSp = new Sprite();
	let uip = new UIPlane(kmhSp);
	uip.transform.scale=new Vector3(5,1,1)
	uip.transform.rotationEuler = new Vector3(-90,0,0);
	sce3d.addChild(uip);
	
	car1 = new Car(sce3d,world.world);
	car1.parse(carData,null);
	car1.enable();
	car1.phyCar.chassisBody.position.set(0,1,0);
	let q = new phyQuat();
	q.setFromEuler(0,Math.PI,0);
	car1.phyCar.chassisBody.quaternion=q;
	car1.showTrack=true;
	car1.onUpdatePoseEnd=function(pos:Vec3,quat:phyQuat){
		let speed = car1.getSpeed();
		kmhSp.graphics.clear();
		kmhSp.graphics.drawRect(0,0,150,30,null,'blue',2);
		kmhSp.graphics.fillText('Speed:'+speed.toFixed(2),0,0,'20px Arial', 'red', 'left');
		uip.buildTex();
		let uipos = uip.transform.position;
		uipos.setValue(pos.x,pos.y+2,pos.z);
		uip.transform.position=uipos;

		// 控制摄像机
		/*
		lastTarget.vadd(pos,lastTarget);
		lastTarget.scale(0.5,lastTarget);
		camctr.target.setValue(lastTarget.x,lastTarget.y,lastTarget.z);
		camctr.updateCam(true);
		*/
	}

	drive();

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY, cam.camera);
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
		//console.log('speed=',car1.phyCar.currentVehicleSpeedKmHour,'Km/H');
	}, 1000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}

async function drive(){

	await delay(1000);
	car1.accel(5);
	await delay(1000);
	car1.steer(45,true);
	await delay(1000);
	car1.steer(-45,true);
	await delay(1000);

	let chassis = car1.phyCar.chassisBody
	for(let i=0; ;i++){
		let cpos = chassis.position;

		if(cpos.z<100 || cpos.x<-100 || cpos.x>100){
			chassis.position.set(0,0,0);
		}
		await delay(1000);
		car1.accel(5);
		let r = Math.random();
		if(r<0.2)car1.steer(90,true);
		else if(r<0.6)
			car1.steer(20,true);
		else
			car1.steer(-20,true);
	}
}