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
import { PhyRender } from "./layawrap/PhyRender";
import ContactMaterial from "./material/ContactMaterial";
import Material from "./material/Material";
import Vec3 from "./math/Vec3";
import Heightfield from "./shapes/Heightfield";
import { PhyMeshSprite } from "./layawrap/debugger/PhyMeshSprite";
import { createTerrainMesh } from "./layawrap/debugger/PhyMesh";
import CannonBody from "./layawrap/CannonBody";
import Quaternion from "./math/Quaternion";
import PhyRay, { hitworldOptions, RayMode } from "./collision/Ray";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

let phyr:PhyRender;

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, 0, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	phyr=PhyRender.inst;
}

function rand(a: number, b: number) {
	let d = b - a;
	return Math.random() * d + a;
}

function testGround(img: HTMLImageElement) {
	//plane
	//addBox(new Vec3(100,100,100), new Vec3(0,-50,0),0,phymtl1);
	let p = new Heightfield([[1,1],[1,1]], null, null, 10);
	let min = new Vec3();
	let max = new Vec3();

	/*
	let scale = new Vec3(10,10,2);
	let imgdt = p.setHeightsFromImage(img, scale) as ImageData;
	//转换data
	let w = imgdt.width;
	let h = imgdt.height;
	let data:number[] = [];
	for(let y=0; y<h; y++){
		for(let x=0; x<w; x++){
			let v = imgdt.data[(y*w+x)*4];
			data.push(v);
		}
	}
	
	let m = createTerrainMesh(new Uint8Array(data), w, h, new Vec3(scale.x,scale.z,scale.y), new Vec3(0, 0, 0));
	*/
	let m = createTerrainMesh(new Uint8Array([255,255,255,255]), 2, 2, new Vec3(10,1,10), new Vec3(0, 0, 0),min,max);
	let renderobj = new PhyMeshSprite(m, min as any as Vector3, max as any as Vector3);
	sce3d.addChild(renderobj);

	var phy = renderobj.addComponent(CannonBody) as CannonBody;
	let shapeq = new Quaternion();
	//shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);	// 正的是顺时针
	phy.addShape(p, new Vector3(0,0,0), shapeq);
	//phy.phyBody.setPos(0, 2, 0);
	phy.setMass(0);
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

		let sp = addSphere(0.3, stpos.x, stpos.y, stpos.z);
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
			case 'R':
				{
					let ray = new Ray(new Vector3(), new Vector3());
					cam.camera.viewportPointToRay(new Vector2(Laya.stage.mouseX, Laya.stage.mouseY), ray);
					let len = 10000;
					let phyRay = new PhyRay();
					phyRay.from.set(ray.origin.x, ray.origin.y, ray.origin.z);
					phyRay.to.set(ray.direction.x * len, ray.direction.y * len, ray.direction.z * len);
					let options: hitworldOptions = { mode: RayMode.CLOSEST };
					if (phyRay.intersectWorld(world.world, options)) {
						let hitpt = phyRay.result.hitPointWorld;
						phyr.addPersistPoint( hitpt);
						console.log('r', phyRay.result)
					}
				}

			default:
				break;
		}
	});
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	let img = new Image();
	img.src = './res/height1.jpg';
	img.onload = (e) => {
		testGround(img);
		test(mtl, cam);
	}
}