import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Event } from "laya/events/Event";
import { mouseDownEmitObj } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Body } from "./objects/Body";
import { Plane } from "./shapes/Plane";
import { Sphere } from "./shapes/Sphere";
import { test_gridbroadphase1, test_raycastInner } from "./testCase";
import { getPhyRender, IPhyRender } from "./world/World";
import { GridBroadphase1 } from "./collision/GridBroadphase1";


//test_gridbroadphase1();
//test_raycastInner();

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
	let world = (scene.addComponent(CannonWorld) as CannonWorld).world;
	world.broadphase = new GridBroadphase1();
	world.gravity.set(0, -10, 0);
	(window as any).phyr = new PhyRender(scene, world);
	world.addContactMaterial(cmtl1).addContactMaterial(cmtl2).addContactMaterial(cmtl3);
	phyr = getPhyRender();

	let bp = new Body(0);
	bp.addShape( new Plane(),new Vec3(), (new Quaternion()).setFromEuler(-Math.PI/2,0,0,'XYZ'))
	//bp.addShape( new Box( new Vec3(100,10,100)));
	world.addBody(bp);

	let b = new Body(1);
	b.addShape( new Sphere(1));//, new Vec3());
	b.setPos(0,1,0);
	//world.addBody(b);

	b = new Body(1);
	b.addShape( new Sphere(1));//, new Vec3());
	b.setPos(1.5,1,0);
	world.addBody(b);	
	//return;

	//添加随机对象
	let maxnum=3000;
	for(let i=0; i<maxnum; i++){
		let b:Body;
		if(Math.random()<0.5){
			b = new Body(1);
		}else{
			b = new Body(0);
		}
		b.addShape( new Sphere(1));//, new Vec3());
		b.setPos(Math.random()*1000, Math.random()*100, Math.random()*1000);
		world.addBody(b);
	}
	
}

function dokey(e: Event, down: boolean) {
	let key = String.fromCharCode(e.keyCode);
	switch (key) {
		case 'X':
			break;
		case 'Y':
			break;
		case 'Z':
			break;
		case 'R':{
			/*
			raycast(world.world,cam.camera,(pt:Vec3, norm:Vec3)=>{
				phyr.addPersistPoint( pt);
			});
			*/
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

async function start(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1){
	cam=camctrl;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	test(mtl, cam);
	

	let q1 = new Quaternion();
	q1.setFromAxisAngle(new Vec3(0,1,0),-Math.PI/4);
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1) {
	//return;
	start(sce,mtl,camctrl);
}