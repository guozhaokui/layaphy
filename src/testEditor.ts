import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Event } from "laya/events/Event";
import { Handler } from "laya/utils/Handler";
import { addBox } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { RotationAction } from "./layawrap/ctrls/RotationAction";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { PositionAction } from "./layawrap/ctrls/PositionAction";
import { IAction } from "./layawrap/ctrls/KeyInputAction";

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

let rotact = new RotationAction();
let posact = new PositionAction();

let curact:IAction|null;

let node:Sprite3D;

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
		curact && curact.apply({applyop:{},lastop:{}});
		curact =null;
	});

	Laya.stage.on(Event.RIGHT_MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		curact && curact.cancel();
		curact=null;
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		switch(e.keyCode){
			case 'R'.charCodeAt(0):
				curact = rotact;
				curact.startAction(node,cam.camera);
				break;
			case 'G'.charCodeAt(0):
				curact = posact;
				curact.startAction(node,cam.camera);
				curact=posact;
				break;
			case 13:// 回车确认
				curact && curact.apply({applyop:{},lastop:{}});
				curact=null;
				break;
		}
	});

	Laya.stage.on(Event.MOUSE_MOVE, null, (e: { stageX: number, stageY: number }) => {
		if(curact)
			curact.onMouseMove(e.stageX,e.stageY);
	});

	Laya.stage.on(Event.KEY_UP, null, (e: Event) => {
		if(curact){
			curact.onKeyEvent(e.keyCode,false);
		}
	});

	Sprite3D.load('res/car/car.lh',Handler.create(null,(model:Sprite3D)=>{
		sce3d.addChild(model);
		node=model;
		//rotact.startAction(model,cam.camera);
	}));

	//testLift();
	//testConveyorbelt();
	//loadObj(oo,world.world);
	setInterval(() => {
		//console.log('speed=',car1.phyCar.currentVehicleSpeedKmHour,'Km/H');
	}, 1000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}