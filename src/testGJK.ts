import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Event } from "laya/events/Event";
import { addBox, addSphere, mouseDownEmitObj, addCapsule } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyCharactorCtrl } from "./layawrap/PhyCharactorCtrl";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { getPhyRender, IPhyRender } from "./world/World";
import { Body } from "./objects/Body";
import { Plane } from "./shapes/Plane";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0.001, 1);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 1);
//cmtl1.contactEquationRelaxation=1;
let cam:MouseCtrl1;

let phyr: IPhyRender;
let ctrl: PhyCharactorCtrl;
let m2v = new Mesh2Voxel();

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, 0, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	phyr = getPhyRender();
}



function test(mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY, cam.camera);
	});
}

function spsp(){
	let a = addSphere(1,0,0,0,1);
	let b = addSphere(1,1.5,0,0,1);

}

function sp_box1(){
	addBox(new Vec3(10,10,10),new Vec3(),0,phymtl1);
	addSphere(1,0,-4.5,0,1);
}

function sp_box(){
	addBox(new Vec3(10,10,10),new Vec3(0,0,0),0,phymtl1);
	addSphere(1,0,5,0,1);
}

function sp_sp(){
	addSphere(2,0,0,0,0);
}

function cap_sp(){
	let b = addCapsule(2,4,0,0,0);
}

function staticobj(){
	//addSphere(1,0,0,0,0);
	addBox(new Vec3(1,1,1),new Vec3(),0,phymtl1);
}

// 球在box上会跳
function error2(){
	let b = addBox(new Vec3(10, 10, 10), new Vec3(0,0,0), 0, phymtl2);
	let q = b.phyBody.quaternion;// new Quaternion();
	//q.setFromAxisAngle(new Vec3(1,0,0), Math.PI/4);

	b.phyBody.allowSleep = false;
	b.phyBody.name = 'ban';
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1) {
	cam=camctrl;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	test(mtl, cam);
	
	//
	//spsp();
	//staticobj();
	sp_box();
	//sp_sp();
	//cap_sp();

}