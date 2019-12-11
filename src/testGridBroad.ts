import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { SAPBroadphase } from "./collision/SAPBroadphase";
import { CannonBody } from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { Box } from "./shapes/Box";
import { Sphere } from "./shapes/Sphere";

/**
 * 测试基于格子的宽检测方法
 * 1000个。collisionPairs函数
 * 暴力检测：
 *  	9~10ms
 */

var sce3d:Scene3D;
var mtl1:BlinnPhongMaterial;


function addSphere(mass:number, r: f32, x: f32, y: f32, z: f32): CannonBody {
	let sph = new MeshSprite3D(PrimitiveMesh.createSphere(r, 32, 32));
    sce3d.addChild(sph);
    sph.meshRenderer.material = mtl1;
    var transform = sph.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;

    var phy =  new CannonBody(); phy.renderobj = sph;// sph.addComponent(CannonBody) as CannonBody;
    phy.addShape(new Sphere(r));
    phy.setMass(mass);
    return phy;
}

class gameBody extends MeshSprite3D{
	phybody:CannonBody;
	constructor(wx:number,wy:number, wz:number, mass:number){
		super(PrimitiveMesh.createBox(wx,wy,wz));
		this.meshRenderer.material = mtl1;
		//物理组件
		var rigidBody = this.phybody = new CannonBody();// this.addComponent(CannonBody) as CannonBody;
		rigidBody.renderobj=this;
		
		var boxShape = new Box(new Vec3(wx / 2, wy / 2, wz / 2));
		//var boxShape=new Sphere(2);
		rigidBody.addShape(boxShape);
		rigidBody.setMass(mass);
		rigidBody.phyBody.linearDamping=0;
		rigidBody.phyBody.preCollision=this.phystep.bind(this);
		rigidBody.enablePhy(false);
	}
	phystep(){
		let b = this.phybody.phyBody;
		let p = b.position;
		let fdir = new Vector3(0-p.x,0-p.y,0-p.z);
		Vector3.normalize(fdir,fdir);
		Vector3.scale(fdir,10,fdir);
		this.phybody.addCenterForce(fdir);
	}

	enablePhy(b:boolean){
		this.phybody.enablePhy(b);
	}

	setPos(x:number,y:number,z:number){

	}
}


function initPhy(scene:Scene3D){
	let phyworld = scene.addComponent(CannonWorld) as CannonWorld;
	let world = phyworld.world;
	//world.broadphase = new GridBroadphase1();
	world.broadphase = new SAPBroadphase(world);
    // phyworld
    phyworld.world.gravity.set(0,0,0);

    (window as any).phyr = new PhyRender(scene, phyworld.world);

    let phymtl1 = new Material();
    let phymtl2 = new Material();
    let phymtl3 = new Material();
    let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0.5, 0);
    let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0.5, 1);
    phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

export function Main(sce:Scene3D, mtl:BlinnPhongMaterial,cam:MouseCtrl1){
	cam.dist=200;
	sce3d=sce;
	mtl1=mtl;
	//mtl.renderMode=BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	addSphere(0,50,0,0,0);

	for(let i=0; i<2000; i++){
		let obj = new gameBody(1,1,2,1);
		sce.addChild(obj);
		obj.transform.localPosition = new Vector3(Math.random()*10,Math.random()*100+50,Math.random()*100);
		obj.enablePhy(true);
		obj.phybody.setVel(31+Math.random()*20,Math.random()*10,Math.random()*10);
		/*
		let vx = Math.random()*100-50;
		let vy = Math.random()*100-50;
		let vz = Math.random()*100-50;
		obj.phybody.setVel(vx,vy,vz);
		*/
	}
	
}