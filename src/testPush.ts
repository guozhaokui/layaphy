import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { CannonWorld } from "./layawrap/CannonWorld";
import { PhyRender } from "./layawrap/PhyRender";
import Material from "./material/Material";
import ContactMaterial from "./material/ContactMaterial";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { addBox } from "./DemoUtils";
import Vec3 from "./math/Vec3";
import { BODYTYPE } from "./objects/Body";
import { Vector3 } from "laya/d3/math/Vector3";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d:Scene3D;
var mtl1:BlinnPhongMaterial;
var world:CannonWorld;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

function initPhy(scene:Scene3D){
    let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
    // phyworld
    phyworld.world.gravity.set(0,0,0);

    (window as any).phyr = new PhyRender(scene, phyworld.world);

    phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

// 左右推动
// 问题：感觉推板插入物体了
function testPush(){
	world.world.gravity.set(0,0,0);
	//plane
	//addBox(new Vec3(100,1,100), new Vec3(0,-1,0),0);

	let ch1 = addBox(new Vec3(1,2,1), new Vec3(0,0,0), 1, phymtl1);
	ch1.fixedRotation=true;
	ch1.phyBody._name='zhu'

	/*
	let push = addBox( new Vec3(1,1,1), new Vec3(2,1,0), 0);
	push.phyBody.type=BODYTYPE.KINEMATIC;
	*/

	let b = addBox( new Vec3(1,0.1,1), new Vec3(3,0,0), 0, phymtl2);
	b.phyBody.type=BODYTYPE.KINEMATIC;
	b.phyBody.allowSleep=false;
	b.phyBody._name='ban';
	let tm=0;
	b.phyBody.onStep=()=>{
		let b1 = b.phyBody;
		b1.position.x=2+10*Math.sin(tm++/100);

	}

	let b2 = addBox( new Vec3(1,0.1,1), new Vec3(-3,0,0), 0, phymtl3);
	b2.phyBody.type=BODYTYPE.KINEMATIC;
	b2.phyBody.allowSleep=false;
	b2.phyBody._name='ban';
	b2.phyBody.onStep=()=>{
		let b1 = b2.phyBody;
		b1.position.x=2+10*Math.sin(tm/100)-6;

	}
}

// 上下推动
// 问题：向下的时候，由于物体跟不上，会抖动
function testLift(){
	world.world.gravity.set(0,-30,0);
	let ch1 = addBox(new Vec3(1,2,1), new Vec3(0,1,0), 1, phymtl1);
	ch1.fixedRotation=true;
	ch1.phyBody._name='zhu'

	let b = addBox( new Vec3(2,0.1,2), new Vec3(0,0,0), 0, phymtl2);
	b.phyBody.type=BODYTYPE.KINEMATIC;
	b.phyBody.allowSleep=false;
	b.phyBody._name='ban';
	let tm=0;
	b.phyBody.onStep=()=>{
		let b1 = b.phyBody;
		b1.position.y=4*Math.sin(tm++/100);

	}
}

// 测试传送带
// 问题：kinematic无法带动其他对象。dynamic能，为什么？
function testConveyorbelt(){
	//world.world.gravity.set(0,-10,0);

	let ch1 = addBox(new Vec3(1,2,1), new Vec3(0,1,0), 1, phymtl1);
	ch1.fixedRotation=true;
	ch1.phyBody._name='zhu'
	ch1.phyBody.onStep=()=>{
		ch1.addCenterForce(new Vector3(0,-10,0))
	}

	let b = addBox( new Vec3(10,0.1,1), new Vec3(-2,-1,0), 1000, phymtl2);
	b.phyBody.type=BODYTYPE.KINEMATIC;
	//b.phyBody.velocity.set(1,0,0);
	b.phyBody.allowSleep=false;
	b.phyBody._name='ban';
	b.phyBody.kinematicUsePos=true;
	let tm=0;
	b.phyBody.onStep=()=>{
		let b1 = b.phyBody;
		b1.position.x=10*Math.sin(tm++/100);
	}
}

export function Main(sce:Scene3D, mtl:BlinnPhongMaterial,cam:MouseCtrl1){
	cam.dist=20;
	sce3d=sce;
	mtl1=mtl;
	mtl.renderMode=BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	
	//testPush();
	//testLift();
	testConveyorbelt();

	//b.phyBody.velocity=new Vec3(-1,0,0);
}