import { TestQLearning } from './DNN/env/games/CarQLearning';
import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { addBox, mouseDownEmitObj } from "./DemoUtils";
import { CarAgent } from "./DNN/env/games/CarAgent";
import { CarCtrl } from "./DNN/env/games/CarCtrlGame";
import { CarDQN } from "./DNN/env/games/CarDQN";
import { CarWorld } from "./DNN/neurojs/CarWorld";
import { Plot } from "./DNN/neurojs/Plot";
import { testTF } from "./DNN/testTF";
import { delay } from "./layawrap/Async";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender, UIPlane } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion as phyQuat, Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Body } from "./objects/Body";
import { Car, carData } from "./objects/Car";
import { getPhyRender, World } from "./world/World";


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
	//addBox(new Vec3(1, 1, 1), new Vec3(0, 1, 0), 0, phymtl1);
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

let plot:Plot;
	
export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	plot = new Plot({bgalpha:0.8});
	Laya.stage.addChild(plot);

	plot.addDataDef(0,0xff,'L',1);
	plot.addDataDef(1,0xff0000,'R',1);


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

	//TEST
	let tt = new TestQLearning();
	tt.train();
	debugger;
	return;
	/*
	let game = new CarCtrl();
	let agent = new CarAgent();
	agent.init(game);
	for(let i=0; i<1000;i++){
		agent.playStep();
	}
	*/
	//TEST
	
	car1 = new Car(sce3d,world.world);
	car1.parse(carData,null);
	car1.enable();
	car1.phyCar.chassisBody.position.set(-20,0,0);
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

}


var distData={
	dDeg:0,

}



/**
 * 角度为0朝向+z
 * 绕着y转90度为+x
 */
const VFRONT = new Vec3(0,0,1);
const VUP = new Vec3(0,1,0);
var front = new Vec3();
const RADIUS = 10;

var targetPos = new Vec3();
/** 朝向圈上的方向。单位向量 */
var vToTarget = new Vec3();
var degCross = new Vec3();
var posdist = new Vec3();
var DIST1 = 100;
function dist(chassis:Body){
	let pos = chassis.position;
	let len = pos.length();
	let k = RADIUS/len;
	targetPos.set(pos.x*k, pos.y*k,pos.z*k);
	// 当前位置到达目标的向量。到原点连线的向量。
	vToTarget.set(-pos.x/len, -pos.y/len, -pos.z/len);
	chassis.quaternion.vmult(VFRONT,front);
	front.normalize();
	// 从前方到圆心的cross
	front.cross(vToTarget,degCross);
	degCross.normalize();
	// 根据前方方向和到圆心的方向计算夹角。也可以用前方方向和圆切线的夹角，但是都不合理，需要结合到圆形的距离
	// atan2(sin,cos)。 90度在左边，-90度在右边。 规格化后1在坐标-1在右边
	let tan = Math.atan2(degCross.y,front.dot(vToTarget))/Math.PI;
	console.log('tan=',tan)

	pos.vsub(targetPos, posdist);
	let dist = posdist.length();
	dist/=DIST1;
	if(dist>1)dist=1;
	let v = chassis.velocity.length();
	act(tan,dist,v, car1);


	console.log('front',front.x,front.y,front.z, tan);
}

function act(degdist:number, posdist:number, v:number, car:Car){
	if(posdist<0.1){

	}else{
		car.steer(90*degdist,true);
	}
	if(v<10)
		car.accel(1);
}

async function drive(){
	let carworld = new CarWorld();
	let aicar = carworld.agents[0];
	let phycar = car1;
	//aicar.car = phycar;

	let age=0;
	let chassis = car1.phyCar.chassisBody
	for(let i=0; ;i++){
		if(i%100==0)
			await delay(1);
		//dist(chassis);
		let loss = aicar.step(plot);
		aicar.handleOut();
		age++;
	}
}

async function drive2(){

	let carworld = new CarWorld();
	let aicar = carworld.agents[0];
	

	let chassis = car1.phyCar.chassisBody
	dist(chassis);
	await delay(1000);
	car1.accel(5);
	await delay(1000);
	dist(chassis);

	car1.steer(45,true);
	await delay(1000);
	dist(chassis);
	car1.steer(-45,true);
	await delay(1000);

	for(let i=0; ;i++){
		await delay(1);
		dist(chassis);
	}
}

//testTF();