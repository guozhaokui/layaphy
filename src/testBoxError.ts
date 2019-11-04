import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { addBox, addSphere } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyCharactorCtrl } from "./layawrap/PhyCharactorCtrl";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { BODYTYPE } from "./objects/Body";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { getPhyRender, IPhyRender } from "./world/World";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0.001, .2);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 0);
let cam:MouseCtrl1;

let phyr: IPhyRender;
let ctrl: PhyCharactorCtrl;
let m2v = new Mesh2Voxel();

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, -10, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	phyr = getPhyRender();
}



function test(mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		let worlde = cam.camera.transform.worldMatrix.elements;
		let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
		let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

		let ray = new Ray(new Vector3(), new Vector3());
		cam.camera.viewportPointToRay(new Vector2(e.stageX, e.stageY), ray);
		stpos.set(ray.origin.x, ray.origin.y, ray.origin.z);
		dir.set(ray.direction.x, ray.direction.y, ray.direction.z);
		//let sp = addSphere(.3, stpos.x, stpos.y, stpos.z);
		let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 10, phymtl1);
		//sp.fixedRotation=true;
		let v = 20;
		setTimeout(() => {
			sp.owner.destroy();
		}, 33000);
		sp.setVel(dir.x * v, dir.y * v, dir.z * v);
	});
}


// 测试传送带
function testConveyorbelt() {
	let b = addBox(new Vec3(10, 0.1, 10), new Vec3(-59, 0.3, 0), 1000, phymtl2);
	b.phyBody.type = BODYTYPE.KINEMATIC;
	//b.phyBody.velocity.set(1,0,0);
	b.phyBody.allowSleep = false;
	b.phyBody.name = 'ban';
	b.phyBody.kinematicUsePos = true;
	let tm = 0;
	b.phyBody.preCollision = () => {
		let b1 = b.phyBody;
		b1.position.x = -70 + 10 * Math.sin(tm++ / 100);
	}
}

// 球在box上会自己移动
function error1(){

}

// 球在box上会跳
function error2(){
	let b = addBox(new Vec3(30, 10.1, 10), new Vec3(-10, 0.3, 0), 0, phymtl2);
	b.phyBody.allowSleep = false;
	b.phyBody.name = 'ban';

	let s = addSphere(0.3,-10,10,0);
	s.phyBody.allowSleep=false;
	s.phyBody.material = phymtl1;
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1) {
	cam=camctrl;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	test(mtl, cam);
	error2();
}