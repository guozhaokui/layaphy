import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Event } from "laya/events/Event";
import { addBox, loadSce, PhyObj } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyCharactorCtrl } from "./layawrap/PhyCharactorCtrl";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { ContactEvent, getPhyRender, IPhyRender } from "./world/World";
import { Timer } from "laya/utils/Timer";

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0.001, .2);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 0);

let phyr:IPhyRender;
let ctrl:PhyCharactorCtrl;

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

	let sp = addBox(new Vec3(0.5, 0.5, 0.5), new Vec3(0.8,10,-29), 1, phymtl1);
	sp.fixedRotation=true;
}

var moving=0;
function dokey(e: Event,down:boolean){
	let key = String.fromCharCode(e.keyCode);
	switch (key) {
		case 'X':
			break;
		case 'Y':
			break;
		case 'Z':
			break;
		case 'R':
			break;
		case 'A':
			ctrl.curDir=90;
			if(down)moving|=1;
			else moving&=(~1);
			//ctrl.step(1/60);
			break;
		case 'S':
			ctrl.curDir=0;
			//ctrl.step(1/60);
			if(down)moving|=2;
			else moving&=(~2);
			break;
		case 'D':
			ctrl.curDir=-90;
			if(down)moving|=4;
			else moving&=(~4);
			//ctrl.step(1/60);
			break;
		case 'W':
			ctrl.curDir=180;
			if(down)moving|=8;
			else moving&=(~8);
			//ctrl.step(1/60);
			break;
		default:
			break;
	}

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
		let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 10, phymtl1);
		//sp.fixedRotation=true;
		let v = 20;
		setTimeout(() => {
			sp.owner.destroy();
		}, 13000);
		sp.setVel(dir.x * v, dir.y * v, dir.z * v);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => { dokey(e,true)});
	Laya.stage.on(Event.KEY_UP, null, (e: Event) => { dokey(e,false)});
}

function createCharCtrl(size:Vec3){
	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x,size.y,size.z));
    sce3d.addChild(box);
    box.meshRenderer.material = mtl1;
    var transform = box.transform;
	var ctrl = box.addComponent(PhyCharactorCtrl) as PhyCharactorCtrl;
    return ctrl;
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	let sceobj = 
	[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.003", "dim": {"x": 1.2832520008087158, "y": 44.06886672973633, "z": 18.270801544189453}, "pos": {"x": 10.349227905273438, "y": -0.4336942434310913, "z": 7.149570465087891}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.006", "dim": {"x": 20.69036293029785, "y": 2.0, "z": 8.276045799255371}, "pos": {"x": 0.10714340209960938, "y": -21.061107635498047, "z": 3.2415902614593506}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.007", "dim": {"x": 21.156166076660156, "y": 2.0, "z": 22.843353271484375}, "pos": {"x": 0.7932448387145996, "y": 28.999530792236328, "z": 5.831474304199219}, "quat": {"x": -0.4526829719543457, "y": -0.0, "z": 0.0, "w": 0.8916715383529663}, "mass": 0}, {"name": "Cube.008", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.82879638671875, "y": 29.197895050048828, "z": 15.298372268676758}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 1.0}, {"name": "Cube.009", "dim": {"x": 0.5103281736373901, "y": 15.272051811218262, "z": 7.38112735748291}, "pos": {"x": 2.218686819076538, "y": -5.52827787399292, "z": 3.0185797214508057}, "quat": {"x": 0.0, "y": 0.0, "z": 0.17481115460395813, "w": 0.9846019744873047}, "mass": 0}]
	loadSce(sce,phymtl2,sceobj as PhyObj[],true)
	test(mtl, cam);

	//
	ctrl = createCharCtrl(new Vec3(0.3,1.8,0.3));
	ctrl.setPos(2,2,2);
	ctrl.curDir=180;
	ctrl.curVel=10;
	ctrl.enableFriction(false);

	Laya.timer.loop(1,null,()=>{
		if(moving){
			ctrl.step(1/60);
		}
	})
}