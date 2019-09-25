import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { CannonWorld } from "./layawrap/CannonWorld";
import { PhyRender } from "./layawrap/PhyRender";
import Material from "./material/Material";
import ContactMaterial from "./material/ContactMaterial";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { addBox } from "./DemoUtils";
import Vec3 from "./math/Vec3";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d:Scene3D;
var mtl1:BlinnPhongMaterial;

function initPhy(scene:Scene3D){
    let phyworld = scene.addComponent(CannonWorld) as CannonWorld;
    // phyworld
    //phyworld.world.gravity.set(0,0,0);

    (window as any).phyr = new PhyRender(scene, phyworld.world);

    let phymtl1 = new Material();
    let phymtl2 = new Material();
    let phymtl3 = new Material();
    let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0, 0);
    let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 1);
    phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

export function Main(sce:Scene3D, mtl:BlinnPhongMaterial,cam:MouseCtrl1){
	cam.dist=200;
	sce3d=sce;
	mtl1=mtl;
	initPhy(sce);
	
	//plane
	addBox(new Vec3(1000,1,1000), new Vec3(0,-1,0),0);

	let ch1 = addBox(new Vec3(1,2,1), new Vec3(), 1);
}