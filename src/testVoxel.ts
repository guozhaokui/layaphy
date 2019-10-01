import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { addBox, addSphere } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { VoxelMaterial } from "./layawrap/debugger/VoxelRender/VoxelMtl";
import { VoxelSprite } from "./layawrap/debugger/VoxelRender/VoxelSprite";
import { PhyRender } from "./layawrap/PhyRender";
import ContactMaterial from "./material/ContactMaterial";
import Material from "./material/Material";
import Vec3 from "./math/Vec3";
import { hashSparseVox, SparseVoxData, Voxel } from "./shapes/Voxel";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import CannonBody from "./layawrap/CannonBody";

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

function rand(a:number,b:number){
	let d = b-a;
	return Math.random()*d+a;
}

function testVoxelGround() {
	//world.world.gravity.set(0, -11, 0);
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
	for(let i=0; i<0; i++){
		let b = addBox(new Vec3(1,1,1), new Vec3(rand(-10,10),rand(5,10),rand(-10,10)),1,phymtl2,true);
		b.phyBody.allowSleep=false;
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

	m2v.loadObj('res/house/house1.obj', 0.5, (voxdata: SparseVoxData) => {
		let vox = new VoxelSprite({get:voxdata.get.bind(voxdata)},voxdata.dataszx,voxdata.dataszy,voxdata.dataszz, 
			voxdata.aabbmin as any as Vector3, 
			voxdata.aabbmax as any as Vector3);
		//vox.createMesh();
		sce.addChild(vox);
	
		let ret = hashSparseVox(voxdata);
		let s = 0;
		ret.forEach(v => {
			if (v) s++;
		})

		let phyvox = new Voxel(voxdata,voxdata.dataszx,voxdata.dataszy, voxdata.dataszz, voxdata.aabbmin, voxdata.aabbmax);
		var phy = vox.addComponent(CannonBody) as CannonBody;
		phy.addShape(phyvox);
		phy.setMass(1);
		phy.phyBody.position.set(0,10,0);
	

		//TEST
		/*
		voxdata.data.forEach(v => {
			let x = v.x;
			let y = v.y;
			let z = v.z;
			if (v.color != 0) {
				addBox(new Vec3(1, 1, 1), new Vec3(x, y, z), 1, phymtl1);
			}
		});
		*/
		//TEST
		console.log('length=', ret.length, 'space=', ret.length - s);
		//debugger;
	});

    Laya.stage.on(Event.MOUSE_DOWN, null, (e:{stageX:number,stageY:number}) => {
		return;
		let worlde = cam.camera.transform.worldMatrix.elements;
		let stpos = new Vec3(worlde[12],worlde[13],worlde[14]);
		let dir = new Vec3(worlde[8],worlde[9],worlde[10]);

		let sp = addSphere(0.5,stpos.x,stpos.y,stpos.z);
		let v = 20;
		sp.setVel(-dir.x*v,-dir.y*v,-dir.z*v);
	});

	//testLift();
	//testConveyorbelt();

	//b.phyBody.velocity=new Vec3(-1,0,0);
}