import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { hitworldOptions, Ray as PhyRay, RayMode } from "./collision/Ray";
import { addBox, loadSce, PhyObj } from "./DemoUtils";
import { CannonBody } from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { createTerrainMesh } from "./layawrap/debugger/PhyMesh";
import { PhyMeshSprite } from "./layawrap/debugger/PhyMeshSprite";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Mat3 } from './math/Mat3';
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Body } from "./objects/Body";
import { Heightfield } from "./shapes/Heightfield";
import { ContactEvent, getPhyRender, IPhyRender } from "./world/World";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var terrain: Body;
let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 0);

let phyr:IPhyRender;

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, -10, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	phyr= getPhyRender();

	//event
	let phyw = world.world;
	phyw.addEventListener('beginContact',(e:ContactEvent)=>{
		console.log('body contact', e.bodyA, e.bodyB);
	})
	phyw.addEventListener('endContact',(e:ContactEvent)=>{
		console.log('body contact end', e.bodyA, e.bodyB);
	})
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

		//let sp = addSphere(3, stpos.x, stpos.y, stpos.z);
		let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 1, phymtl1);
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
	let sceobj = 
	[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.003", "dim": {"x": 1.2832520008087158, "y": 44.06886672973633, "z": 18.270801544189453}, "pos": {"x": 10.349227905273438, "y": -0.4336942434310913, "z": 7.149570465087891}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.006", "dim": {"x": 20.69036293029785, "y": 2.0, "z": 28.550573348999023}, "pos": {"x": 0.10714340209960938, "y": -21.061107635498047, "z": 4.7616424560546875}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}]
	loadSce(sce,phymtl2,sceobj as PhyObj[],true)
	test(mtl, cam);
}