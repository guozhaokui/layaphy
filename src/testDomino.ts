import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { hitworldOptions, Ray as PhyRay, RayMode } from "./collision/Ray";
import { addBox, addSphere } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { CannonBody } from "./layawrap/CannonBody";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "./math/Quaternion";
import { Plane } from "./shapes/Plane";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;

let phymtl1 = new Material();
let phymtl2 = new Material();
//let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl2, phymtl2, 0, 0);

let phyRay = new PhyRay();

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	// phyworld
	phyworld.world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, phyworld.world);

	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

function rand(a: number, b: number) {
	let d = b - a;
	return Math.random() * d + a;
}

function createGround(box: boolean) {
	world.world.gravity.set(0, -11, 0);
	//plane
	if (box) {
		let p = addBox(new Vec3(100, 100, 100), new Vec3(0, -50, 0), 0, phymtl1);
		return;
	} else {

		let plane = new Sprite3D();
		let planephy = plane.addComponent(CannonBody) as CannonBody;
		planephy.setMaterial(phymtl1);
		planephy.setName('plane');
		let shapeq = new Quaternion();
		shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
		planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
		planephy.setMass(0);
	}
}


export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	createGround(false);

	// 问题： box和plane的碰撞没有问题，但是box和box的碰撞在不是原点的地方不太对，不稳定
	for (let i = 0; i < 1; i++) {
		let b = addBox(new Vec3(1, 2, 0.3), new Vec3(0, 1.5, -20 + -1.5 * i), 1, phymtl2, false);
		b.phyBody.allowSleep = false;
	}

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		let worlde = cam.camera.transform.worldMatrix.elements;
		let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
		let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

		let ray = new Ray(new Vector3(), new Vector3());
		cam.camera.viewportPointToRay(new Vector2(e.stageX, e.stageY), ray);
		stpos.set(ray.origin.x, ray.origin.y, ray.origin.z);
		dir.set(ray.direction.x, ray.direction.y, ray.direction.z);

		let sp = addSphere(0.1, stpos.x, stpos.y, stpos.z);
		//let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 1, phymtl1);
		let v = 20;
		setTimeout(() => {
			sp.owner.destroy();
		}, 13000);
		sp.setVel(dir.x * v, dir.y * v, dir.z * v);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		let key = String.fromCharCode(e.keyCode);
		switch (key) {
			case 'X':
				break;
			case 'Y':
				break;
			case 'Z':
				break;
			default:
				break;
			case 'R'://ray
				{
					let ray = new Ray(new Vector3(), new Vector3());
					cam.camera.viewportPointToRay(new Vector2(Laya.stage.mouseX, Laya.stage.mouseY), ray);
					let len = 10000;
					phyRay.from.set(ray.origin.x, ray.origin.y, ray.origin.z);
					phyRay.to.set(ray.direction.x * len, ray.direction.y * len, ray.direction.z * len);
					let options: hitworldOptions = { mode: RayMode.CLOSEST };
					if (phyRay.intersectWorld(world.world, options)) {
						console.log('r', phyRay.result)
					}
				}
				break;
		}
	});
}
