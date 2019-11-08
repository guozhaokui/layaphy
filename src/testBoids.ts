import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import {CannonBody} from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import {ContactMaterial} from "./material/ContactMaterial";
import {Material} from "./material/Material";
import {Vec3} from "./math/Vec3";
import {Box} from "./shapes/Box";
import {Sphere} from "./shapes/Sphere";

var sce3d:Scene3D;
var mtl1:BlinnPhongMaterial;

/**
 * 1. 分离：避免拥挤
 * 2. 对齐：方向对齐（局部，整体？）
 * 3. 聚集：靠近平均位置（局部，整体？）
 */
class boid{
	dir:Vec3;
	v=1;
}

class boids{
	bodies:boid[]=[];
	init(){

	}
	update(){

	}

	updateone(b:boid){
		//获得局部群体：pos,dir,dist,angstart,angend

	}

	// 低优先级的行动规划，避免碰撞
	plan(){

	}
}

function addSphere(mass:number, r: f32, x: f32, y: f32, z: f32): CannonBody {
	let sph = new MeshSprite3D(PrimitiveMesh.createSphere(r, 32, 32));
    sce3d.addChild(sph);
    sph.meshRenderer.material = mtl1;
    var transform = sph.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;

    var phy = sph.addComponent(CannonBody) as CannonBody;
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
		var rigidBody = this.phybody = this.addComponent(CannonBody) as CannonBody;
		var boxShape = new Box(new Vec3(wx / 2, wy / 2, wz / 2));
		//var boxShape=new Sphere(2);
		rigidBody.addShape(boxShape);
		rigidBody.setMass(mass);
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

	for(let i=0; i<1000; i++){
		let obj = new gameBody(1,1,2,1);
		sce.addChild(obj);
		obj.transform.localPosition = new Vector3(Math.random()*10,Math.random()*100+50,Math.random()*100);
		obj.enablePhy(true);
		obj.phybody.setVel(31+Math.random()*20,Math.random()*10,Math.random()*10);
	}
	
}