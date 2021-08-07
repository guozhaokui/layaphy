import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { addBox, addSphere, createVoxelBox, JSONLoader, loadVoxel, mouseDownEmitObj, nodeProxy, ZupPos2Yup, ZupQuat2Yup } from "./DemoUtils";
import { CannonBody } from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { ttt, updateStatus } from "./layawrap/ctrls/GamePadTest";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender, UIPlane } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion as phyQuat } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Car, carData } from "./objects/Car";
import { Box } from "./shapes/Box";
import { GSSolver } from "./solver/GSSolver";


// TEST

//test_sphere_vox();
// TEST

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;

let phymtl1 = new Material("1",1,0);
let phymtl2 = new Material('2',1,0);
let phymtl3 = new Material('3',1,0);
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);


// 加载器
class NodeLoaderProxy implements nodeProxy{
	rnode:CannonBody;
	zup=true;
	constructor(){
		this.rnode=new CannonBody();
		this.rnode._onAdded();
	}
	
	getRealNode() {
		return this.rnode;
	}

	setProp(name: string, value: any, node: any, loader: JSONLoader): void {
		var rigidBody = this.rnode;//new CannonBody();

		//rigidBody.phyBody.material = phymtl;
		switch(name){
			case 'name':
				rigidBody.setName(value);
				break;
			case 'dim':
				let boxShape = new Box(new Vec3(value.x / 2, value.y / 2, value.z / 2));
				rigidBody.addShape(boxShape);
				break;
			case 'pos':
				let pos = new Vec3(value.x,value.y,value.z);
				ZupPos2Yup(pos,pos);
				rigidBody.phyBody.position.copy(pos);
				break;
			case 'quat':
				let quat = new phyQuat(value.x,value.y,value.z,value.w);
				ZupQuat2Yup(quat,quat);
				rigidBody.phyBody.quaternion.copy(quat);
				break;
			case 'mass':
				rigidBody.setMass(value);
				break;
		}
	}
	setPropEnd(node: any, loader: JSONLoader): void {
		var rigidBody = this.rnode
		rigidBody.phyBody.aabbNeedsUpdate=true
		rigidBody.phyBody.material= phymtl2;
		let phypos = rigidBody.phyBody.position;
		let phyquat = rigidBody.phyBody.quaternion;

		// 调试渲染模型
		let box = new MeshSprite3D(PrimitiveMesh.createBox(node.dim.x,node.dim.y,node.dim.z));
		sce3d.addChild(box);
		box.meshRenderer.material = mtl1;
		var transform = box.transform;
		var p = transform.position;
		p.setValue(phypos.x, phypos.y, phypos.z);
		transform.position = p;
		let quat = transform.rotation;
		quat.x = phyquat.x; quat.y=phyquat.y; quat.z=phyquat.z; quat.w=phyquat.w;
		transform.rotation=quat;
		this.rnode.renderobj=box;
	}
}
	
export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 30;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;

	let phyworld = world = sce.addComponent(CannonWorld) as CannonWorld;

	(window as any).phyr = new PhyRender(sce, phyworld.world);
	world.world.defaultContactMaterial.friction=0.0;
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
	world.world.enableFriction(false);
	(world.world.solver as GSSolver).iterations=100;

	world.world.gravity.set(0, -10, 0);
	let up = addBox(new Vec3(4, 4, 4), new Vec3(0, 4, 0), 10, phymtl1);
	let p = addBox(new Vec3(0.14, 4, 0.14), new Vec3(0, 0, 0), 0, phymtl1);


	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
	});

	Laya.stage.on(Event.KEY_UP, null, (e: Event) => {
	});


}

