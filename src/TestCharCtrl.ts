import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Event } from "laya/events/Event";
import { addBox, loadSce, PhyObj, addSphere, raycast } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyCharactorCtrl } from "./layawrap/PhyCharactorCtrl";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { getPhyRender, IPhyRender } from "./world/World";
import { Heightfield } from "./shapes/Heightfield";
import { createTerrainMesh, createVoxMesh } from "./layawrap/debugger/PhyMesh";
import { PhyMeshSprite } from "./layawrap/debugger/PhyMeshSprite";
import { CannonBody } from "./layawrap/CannonBody";
import { Quaternion } from "./math/Quaternion";
import { BODYTYPE } from "./objects/Body";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { SparseVoxData, Voxel } from "./shapes/Voxel";
import { vox_diban } from "./diban.vox";
import { vox_shu } from "./shu.vox";

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

let emitPos = new Vec3();
let emitDir = new Vec3();
let lockEmit = false;

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	phyworld.world.gravity.set(0, 0, 0);
	(window as any).phyr = new PhyRender(scene, phyworld.world);
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	phyr = getPhyRender();
}

var moving = 0;
var dir = new Vec3();
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
			raycast(world.world,cam.camera,(pt:Vec3, norm:Vec3)=>{
				phyr.addPersistPoint( pt);
			});
		}
			break;
		case 'A':
			dir.x = down ? -1 : 0;
			//ctrl.curDir=90;
			if (down) moving |= 1;
			else moving &= (~1);
			break;
		case 'S':
			dir.z = down ? 1 : 0;
			//ctrl.curDir=0;
			//ctrl.step(1/60);
			if (down) moving |= 2;
			else moving &= (~2);
			break;
		case 'D':
			dir.x = down ? 1 : 0;
			//ctrl.curDir=-90;
			if (down) moving |= 4;
			else moving &= (~4);
			break;
		case 'W':
			dir.z = down ? -1 : 0;
			//ctrl.curDir=180;
			if (down) moving |= 8;
			else moving &= (~8);
			break;
		case 'P':
			if (down)
				world.world.pause();
			break;
		case ' ':
			if (down) {
				ctrl.jump(new Vector3(0, 10, 0))
			}
			break;
		case 'L': // 锁定发射位置和方向
			if(!down)
				lockEmit=!lockEmit;
			break;
		default:
			break;
	}

	dir.normalize();
	ctrl.curVDir = dir;

}

function test(mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		let worlde = cam.camera.transform.worldMatrix.elements;
		let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
		let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

		let ray = new Ray(new Vector3(), new Vector3());
		cam.camera.viewportPointToRay(new Vector2(e.stageX, e.stageY), ray);
		if(!lockEmit){
			emitPos.set(ray.origin.x, ray.origin.y, ray.origin.z);
			//DEBUG
			//emitPos.set(-31.65083976589477,20.991332874362374,66.50135643487836 );
		}

		stpos.set(emitPos.x, emitPos.y, emitPos.z);

		if(!lockEmit){
			emitDir.set(ray.direction.x, ray.direction.y, ray.direction.z);
			//DEBUG
			//emitDir.set(-0.18446392214973648,-0.17484450459282244,-0.9671620653431494);
		}
		
		dir.set(emitDir.x,emitDir.y,emitDir.z);
		let sp = addSphere(.3, stpos.x, stpos.y, stpos.z);
		//let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 10, phymtl1);
		//sp.fixedRotation=true;
		let v = 20;
		setTimeout(() => {
			sp.owner.destroy();
		}, 33000);
		sp.setVel(dir.x * v, dir.y * v, dir.z * v);
	});

	Laya.stage.on(Event.MOUSE_MOVE, null, (e:Event)=>{

	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => { dokey(e, true) });
	Laya.stage.on(Event.KEY_UP, null, (e: Event) => { dokey(e, false) });
}

function createCharCtrl(size: Vec3) {
	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x, size.y, size.z));
	sce3d.addChild(box);
	box.meshRenderer.material = mtl1;
	var transform = box.transform;
	var ctrl = box.addComponent(PhyCharactorCtrl) as PhyCharactorCtrl;
	return ctrl;
}

// 测试传送带
function testConveyorbelt() {
	let b = addBox(new Vec3(10, 0.1, 10), new Vec3(-79, 0.3, 0), 1000, phymtl2);
	b.phyBody.type = BODYTYPE.KINEMATIC;
	//b.phyBody.velocity.set(1,0,0);
	b.phyBody.allowSleep = false;
	b.phyBody.name = 'ban';
	b.phyBody.kinematicUsePos = true;
	let tm = 0;
	b.phyBody.preCollision = () => {
		let b1 = b.phyBody;
		b1.position.x = -80 + 10 * Math.sin(tm++ / 100);
	}
}


function testGround(img: HTMLImageElement) {
	//plane
	//addBox(new Vec3(100,100,100), new Vec3(0,-50,0),0,phymtl1);
	let min = new Vec3();
	let max = new Vec3();

	let p = new Heightfield([[1, 1], [1, 1]], null, null, 10);
	/*
	let m = createTerrainMesh(new Uint8Array([255,255,255,255]), 2, 2, new Vec3(10,1,10), new Vec3(0, 0, 0),min,max);
	*/

	let scale = new Vec3(100, 20, 100);
	let imgdt = p.setHeightsFromImage(img, scale) as ImageData;
	//转换data
	let w = imgdt.width;
	let h = imgdt.height;
	let data: number[] = [];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let v = imgdt.data[(y * w + x) * 4];
			data.push(v);
		}
	}

	let m = createTerrainMesh(new Uint8Array(data), w, h, scale, new Vec3(0, 0, 0), min, max);

	let renderobj = new PhyMeshSprite(m, min as any as Vector3, max as any as Vector3);
	sce3d.addChild(renderobj);

	var phy = renderobj.addComponent(CannonBody) as CannonBody;
	let shapeq = new Quaternion();
	//shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);	// 正的是顺时针
	phy.addShape(p, new Vector3(0, 0, 0), shapeq);
	//phy.phyBody.setPos(0, 2, 0);
	phy.setMass(0);
	phy.setPos(-210, 0.31, -60);
	let terrain = phy.phyBody;
}

function loadVoxel(file:string, pos?:Vec3,q?:Quaternion,scale?:Vec3) {
	m2v.loadObj(file, 0.25, (voxdata: SparseVoxData) => {
		console.time('voxel');
		
		let phyvox = new Voxel(voxdata,3);
		console.timeEnd('voxel');

		let dt = phyvox.bitDataLod[0];
		let min = dt.min as any as Vector3;
		let max = dt.max as any as Vector3;
		let mesh = createVoxMesh(
			{ get: function (x: int, y: int, z: int) { return dt.getBit(x, y, z); } }, 
			dt.xs * 2, dt.ys * 2, dt.zs * 2, dt.rx, dt.ry, dt.rz, min, max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);		
		let vox = new PhyMeshSprite(mesh, min, max);
		//vox.createMesh();
		sce3d.addChild(vox);
		vox.transform.localPosition.setValue(0, 0, 0);
		var phy = vox.addComponent(CannonBody) as CannonBody;
		phy.phyBody.dbgShow=true;
		if(scale){
			phy.phyBody.setScale(scale.x,scale.y,scale.z);
			vox.transform.scale =  new Vector3(scale.x, scale.y, scale.z);
		}
		phy.addShape(phyvox);
		if(pos){
			phy.phyBody.setPos(pos.x,pos.y,pos.z);
		}
		
		if(q){
			phy.phyBody.quaternion.copy(q);
		}

		phy.setMass(0);
	});
}

function loadJSONCubeModuleObj(obj:any,pos?:Vec3,q?:Quaternion){
	let dtArr:number[] = [];
	Object.assign(dtArr,obj._data);//{"0":0,"1":0}
	obj._data = new Uint8Array(dtArr)

	let phyvox = new Voxel(obj,1);

	let dt = phyvox.bitDataLod[0];
	let min = dt.min as any as Vector3;
	let max = dt.max as any as Vector3;
	let mesh = createVoxMesh(
		{ get: function (x: int, y: int, z: int) { return dt.getBit(x, y, z); } }, 
		dt.xs * 2, dt.ys * 2, dt.zs * 2, dt.rx,dt.ry,dt.rz, min, max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);		
	let vox = new PhyMeshSprite(mesh, min, max);
	//vox.createMesh();
	sce3d.addChild(vox);
	vox.transform.localPosition.setValue(0, 0, 0);
	var phy = vox.addComponent(CannonBody) as CannonBody;
	phy.addShape(phyvox);
	if(pos){
		phy.phyBody.setPos(pos.x,pos.y,pos.z);
	}
	
	if(q){
		phy.phyBody.quaternion.copy(q);
	}

	phy.setMass(0);
}

function testTrigger(){
	let b = addBox(new Vec3(10,10,2), new Vec3(-30,2,0),0,phymtl1);
	b.phyBody.isTrigger=true;
}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, camctrl: MouseCtrl1) {
	cam=camctrl;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	let sceobj =
		[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.003", "dim": {"x": 1.2832520008087158, "y": 44.06886672973633, "z": 8.352557182312012}, "pos": {"x": 10.349227905273438, "y": -0.4336942434310913, "z": 3.357720375061035}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.006", "dim": {"x": 20.69036293029785, "y": 2.0, "z": 2.4215731620788574}, "pos": {"x": 0.10714340209960938, "y": -21.061107635498047, "z": 0.5030307769775391}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.007", "dim": {"x": 21.156166076660156, "y": 2.0, "z": 22.843353271484375}, "pos": {"x": 0.7932448387145996, "y": 28.999530792236328, "z": 5.831474304199219}, "quat": {"x": -0.4526829719543457, "y": -0.0, "z": 0.0, "w": 0.8916715383529663}, "mass": 0}, {"name": "Cube.008", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.82879638671875, "y": 29.197895050048828, "z": 15.298372268676758}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.009", "dim": {"x": 0.5103281736373901, "y": 15.272051811218262, "z": 7.38112735748291}, "pos": {"x": 2.218686819076538, "y": -5.52827787399292, "z": 3.0185797214508057}, "quat": {"x": 0.0, "y": 0.0, "z": 0.17481115460395813, "w": 0.9846019744873047}, "mass": 0}, {"name": "Cube.010", "dim": {"x": 39.56965637207031, "y": 46.535789489746094, "z": 2.0}, "pos": {"x": -36.34748840332031, "y": -1.1900715827941895, "z": 0.12122726440429688}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.011", "dim": {"x": 0.6901216506958008, "y": 15.746346473693848, "z": 1.3006709814071655}, "pos": {"x": -16.843605041503906, "y": 14.00429916381836, "z": 4.685491561889648}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.012", "dim": {"x": 7.238906383514404, "y": 6.746131420135498, "z": 0.257480263710022}, "pos": {"x": -13.103920936584473, "y": -10.703566551208496, "z": 0.40030667185783386}, "quat": {"x": 0.0, "y": 0.07997595518827438, "z": 0.0, "w": 0.9967967867851257}, "mass": 0}]
	loadSce(sce, phymtl2, sceobj as PhyObj[], true)
	test(mtl, cam);

	let q1 = new Quaternion();
	q1.setFromAxisAngle(new Vec3(0,1,0),-Math.PI/4);

	loadVoxel('res/house/house1.obj',new Vec3(-37, 1, 45));//, undefined, new Vec3(-1,-1,1));
	loadVoxel('res/house/wall.obj',new Vec3(-37,1, 0),undefined, new Vec3(0.2,0.2,0.2));

	loadJSONCubeModuleObj(vox_diban, new Vec3(-37,0,100));
	loadJSONCubeModuleObj(vox_shu, new Vec3(-37,0,100));
	//
	(window as any).ctrl = ctrl = createCharCtrl(new Vec3(0.3, 1.8, 0.3));
	ctrl.setPos(-2, 2, 2);
	ctrl.curDir = 180;
	ctrl.curVel = 10;
	ctrl.friction = 0;
	ctrl.enableFriction(true);

	//
	let cmtl = new ContactMaterial(phymtl2,ctrl._mtl,0.2,0);
	world.world.addContactMaterial(cmtl);

	Laya.timer.loop(1, null, () => {
		raycast(world.world,cam.camera,(pt:Vec3, norm:Vec3)=>{
			//phyr.addPersistPoint( pt);
		});

		if (moving) {
			ctrl.step(1 / 60);
		}
	})

	testConveyorbelt();
	testTrigger();

	let img = new Image();
	img.src = './res/height1.jpg';
	img.onload = (e) => {
		testGround(img);
	}
}