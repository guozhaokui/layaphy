import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { addBox, addCapsule } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { getPhyRender, IPhyRender } from "./world/World";
import { Quaternion } from "./math/Quaternion";



let phymtl1 = new Material('box',0,1);
let phymtl2 = new Material('cap',0,1);
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0, 1);
var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
let cam:MouseCtrl1;
let phyr: IPhyRender;

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, 0, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1);
	phyr = getPhyRender();
}


export function Main(sce:Scene3D, mtl:BlinnPhongMaterial,camc:MouseCtrl1){
	cam=camc;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	initPhy(sce);

	let box = addBox(new Vec3(2,2,2),new Vec3(),1,phymtl1);
	box.phyBody.allowSleep=false;

	let cap = addCapsule(1,10,-1,0,0);
	cap.phyBody.allowSleep=false;
	cap.phyBody.quaternion.setFromAxisAngle( new Vec3(1,0,0), Math.PI/4);

}