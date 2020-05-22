import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { addBox } from "./DemoUtils";
import { PhyRender } from "./layawrap/PhyRender";
import { CannonWorld } from "./layawrap/CannonWorld";
import { Vec3 } from "./math/Vec3";
import { Sprite } from "laya/display/Sprite";
import { Material } from "./material/Material";
import { ContactMaterial } from "./material/ContactMaterial";
import { Body } from "./objects/Body";
import { Box } from "./shapes/Box";
import { Sphere } from "./shapes/Sphere";
import { GSSolver } from "./solver/GSSolver";
import { Narrowphase } from "./world/Narrowphase";


/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

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
	let world = (scene.addComponent(CannonWorld) as CannonWorld).world;
	let solver = world.solver as GSSolver;
	solver.iterations=11;

	// phyworld
	world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, world);
	world.defaultContactMaterial.friction=0.6;
	world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	//enableFriction = false;
	world.enableFriction(false);

	let b1 = new Body(0);
	let b2 = new Body(0);
	b1.addShape( new Sphere(1));
	b2.addShape( new Sphere(1));
	b1.setPos(-2,0,0);
	b2.setPos(2,0,0);
	world.addBody(b1);
	world.addBody(b2);

	let b3 = new Body(1, new Sphere(1.3));
	b3.setPos(0,0,0);
	world.addBody(b3);
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

}

