import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { addBox, addSphere } from "./DemoUtils";
import CannonBody from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { VoxBuildBox } from "./layawrap/debugger/VoxelBuilder";
import { VoxelMaterial } from "./layawrap/debugger/VoxelRender/VoxelMtl";
import { VoxelSprite } from "./layawrap/debugger/VoxelRender/VoxelSprite";
import { PhyRender } from "./layawrap/PhyRender";
import ContactMaterial from "./material/ContactMaterial";
import Material from "./material/Material";
import Vec3 from "./math/Vec3";
import { SparseVoxData, Voxel, hashSparseVox } from "./shapes/Voxel";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

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

function testVoxelGround() {
	world.world.gravity.set(0, -11, 0);
	//plane
	let p =addBox(new Vec3(100,100,100), new Vec3(0,-50,0),0,phymtl1);
	/*
	let plane = new Sprite3D();
    let planephy = plane.addComponent(CannonBody) as CannonBody;
    planephy.setMaterial(phymtl1);
    planephy.setName('plane');
    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
	planephy.setMass(0);
	*/


	//let ch1 = addBox(new Vec3(1, 2, 1), new Vec3(0, 1, 0), 1, phymtl1);
	for (let i = 0; i < 0; i++) {
		let b = addBox(new Vec3(1, 1, 1), new Vec3(rand(-10, 10), rand(5, 10), rand(-10, 10)), 1, phymtl2, true);
		b.phyBody.allowSleep = false;
	}
	//ch1.fixedRotation = true;
	//ch1.phyBody._name = 'zhu'

	/*
	let push = addBox( new Vec3(1,1,1), new Vec3(2,1,0), 0);
	push.phyBody.type=BODYTYPE.KINEMATIC;
	*/

	/*
	let b = addBox(new Vec3(1, 0.1, 1), new Vec3(3, 0, 0), 0, phymtl2);
	b.phyBody.type = BODYTYPE.KINEMATIC;
	b.phyBody.allowSleep = false;
	b.phyBody._name = 'ban';
	let tm = 0;
	b.phyBody.onStep = () => {
		let b1 = b.phyBody;
		b1.position.x = 2 + 10 * Math.sin(tm++ / 100);

	}

	let b2 = addBox(new Vec3(1, 0.1, 1), new Vec3(-3, 0, 0), 0, phymtl3);
	b2.phyBody.type = BODYTYPE.KINEMATIC;
	b2.phyBody.allowSleep = false;
	b2.phyBody._name = 'ban';
	b2.phyBody.onStep = () => {
		let b1 = b2.phyBody;
		b1.position.x = 2 + 10 * Math.sin(tm / 100) - 6;
	}
	*/
}

function createBoxVoxel(xn: i32, yn: i32, zn: i32, min: Vec3, max: Vec3) {
	let dt = VoxBuildBox(xn, yn, zn, false);
	let voxdt = new SparseVoxData(dt, xn, yn, zn, min, max);
	let vox = new VoxelSprite({ get: voxdt.get.bind(voxdt) }, voxdt.dataszx, voxdt.dataszy, voxdt.dataszz,
		voxdt.aabbmin as any as Vector3,
		voxdt.aabbmax as any as Vector3);
	//vox.createMesh();
	sce3d.addChild(vox);

	let phyvox = new Voxel(voxdt);
	var phy = vox.addComponent(CannonBody) as CannonBody;
	phy.addShape(phyvox);
	phy.phyBody.position.set(0, 0, 0);
	phy.setMass(110);
}

let m2v = new Mesh2Voxel();

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	//显示voxel
	VoxelMaterial.initShader();

	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	testVoxelGround();

	//createBoxVoxel(8, 8, 8, new Vec3(0, 0, 0), new Vec3(4, 4, 4));
	m2v.loadObj('res/house/house1.obj', 0.1, (voxdata: SparseVoxData) => {
		console.time('voxel');
		let phyvox = new Voxel(voxdata);
		console.timeEnd('voxel');

		let dt = phyvox.bitDataLod[0];
		let vox = new VoxelSprite(
			//{ get: function(x,y,z){return dt.getBit(x,y,z);} }, voxdata.dataszx, voxdata.dataszy, voxdata.dataszz,
			{ get: function(x,y,z){return dt.getBit(x,y,z);} }, dt.xs*2, dt.ys*2, dt.zs*2,
			dt.min as any as Vector3,
			dt.max as any as Vector3);
		//vox.createMesh();
		sce.addChild(vox);
		vox.transform.localPosition.setValue(0,0,0);


		for(let i=1; i<phyvox.bitDataLod.length; i++){
			dt = phyvox.bitDataLod[i];
			let vox1 = new VoxelSprite(
				//{ get: function(x,y,z){return dt.getBit(x,y,z);} }, voxdata.dataszx, voxdata.dataszy, voxdata.dataszz,
				{ get: function(x,y,z){return dt.getBit(x,y,z);} }, dt.xs*2, dt.ys*2, dt.zs*2,
				dt.min as any as Vector3,
				dt.max as any as Vector3);
			//vox.createMesh();
			sce.addChild(vox1);
			vox1.transform.localPosition = new Vector3(14*i,0,0);
		}

		/*
		let ret = hashSparseVox(voxdata);
		let s = 0;
		ret.forEach(v => {
			if (v) s++;
		})
		console.log('length=', ret.length, 'space=', ret.length - s);
		*/
		var phy = vox.addComponent(CannonBody) as CannonBody;
		phy.addShape(phyvox);
		phy.phyBody.position.set(0, 0, 0);
		phy.setMass(0);

	});

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		let worlde = cam.camera.transform.worldMatrix.elements;
		let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
		let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

		let ray = new Ray(new Vector3(), new Vector3());
		cam.camera.viewportPointToRay(new Vector2(e.stageX,e.stageY), ray);
		stpos.set(ray.origin.x, ray.origin.y, ray.origin.z);
		dir.set(ray.direction.x,ray.direction.y,ray.direction.z);

		let sp = addSphere(0.3,stpos.x,stpos.y,stpos.z);
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
		}
	});

	//testLift();
	//testConveyorbelt();

	//b.phyBody.velocity=new Vec3(-1,0,0);
}