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
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { SparseVoxData, hashSparseVox } from "./shapes/Voxel";
import CannonBody from "./layawrap/CannonBody";
import Quaternion from "./math/Quaternion";
import Plane from "./shapes/Plane";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { VoxelMaterial } from "./layawrap/debugger/VoxelRender/VoxelMtl";
import { VoxelSprite } from "./layawrap/debugger/VoxelRender/VoxelSprite";

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
	for(let i=0; i<1; i++){
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
	mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	testVoxelGround();

	m2v.loadObj('res/house/house1.obj', 0.05, (voxdata: SparseVoxData) => {
		let vox = new VoxelSprite({get:voxdata.get.bind(voxdata)},voxdata.dataszx,voxdata.dataszy,voxdata.dataszz);
		//vox.createMesh();
		sce.addChild(vox);
	
		let ret = hashSparseVox(voxdata);
		let s = 0;
		ret.forEach(v => {
			if (v) s++;
		})

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

	//testLift();
	//testConveyorbelt();

	//b.phyBody.velocity=new Vec3(-1,0,0);
}