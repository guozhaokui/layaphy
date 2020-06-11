import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { mouseDownEmitObj, raycast, addBox } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { getPhyRender, IPhyRender } from "./world/World";
import { Body } from "./objects/Body";
import { HingeConstraint } from "./constraints/HingeConstraint";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
let phymtl1 = new Material();
let phymtl2 = new Material('sce',0,1);
let phymtl3 = new Material();
let phySph = new Material('sph',0,0.1);
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0.1, .0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 0);
let cmtl3 = new ContactMaterial(phySph, phymtl2, 0, 1);
let cam:MouseCtrl1;

let phyr: IPhyRender;

let lockEmit = false;

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, -10, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2).addContactMaterial(cmtl3);
	phyr = getPhyRender();
}

function dokey(e: Event, down: boolean) {
	let key = String.fromCharCode(e.keyCode);
	switch (key) {
		case 'R':{
			raycast(world.world,cam.camera,(pt:Vec3, norm:Vec3)=>{
				phyr.addPersistPoint( pt);
			});
		}
			break;
		case 'P':
			if (down)
				world.world.pause();
			break;
		case 'L': // 锁定发射位置和方向
			if(!down)
				lockEmit=!lockEmit;
			break;
		default:
			break;
	}

}

function test(mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX,e.stageY,cam.camera,lockEmit, phymtl1);
	});

	Laya.stage.on(Event.MOUSE_MOVE, null, (e:Event)=>{

	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => { dokey(e, true) });
	Laya.stage.on(Event.KEY_UP, null, (e: Event) => { dokey(e, false) });
}


function start(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1){
	cam=camctrl;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	//loadSce(sce, phymtl2, sceobj as PhyObj[], true)
	test(mtl, cam);

	let q1 = new Quaternion();
	q1.setFromAxisAngle(new Vec3(0,1,0),-Math.PI/4);
	
}

var tmpPos=new Vec3();
var tmpAxis=new Vec3();
/**
 * 
 * @param b 
 * @param pos 
 * @param axis 世界坐标
 */
function anchorBody(b:Body, pos:Vec3, axis:Vec3){
	pos.vsub(b.position,tmpPos);
	let c = new HingeConstraint(world.dummyBody,b,1e6,pos,tmpPos,axis,axis);
	world.world.addConstraint(c);
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1) {
	start(sce,mtl,camctrl);
	let b = addBox(new Vec3(4,1,1), new Vec3(), 1, phymtl1);
	anchorBody(b.phyBody, new Vec3(-2,0,0), new Vec3(0,0,1));
}