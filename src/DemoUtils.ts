import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { CannonBody } from "./layawrap/CannonBody";
import { Material, Material as PhyMtl } from "./material/Material";
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Box } from "./shapes/Box";
import { Capsule } from "./shapes/Capsule";
import { ConvexPolyhedron } from "./shapes/ConvexPolyhedron";
import { Sphere } from "./shapes/Sphere";
import { Ray as PhyRay, hitworldOptions, RayMode } from "./collision/Ray";
import { Ray } from "laya/d3/math/Ray";
import { Camera } from "laya/d3/core/Camera";
import { Vector2 } from "laya/d3/math/Vector2";
import { Laya } from "Laya";
import { World } from "./world/World";

var scene:Scene3D;
var mtl:BaseMaterial;

let zup2yupQ = new Quaternion();
zup2yupQ.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);

export function initDemo(sce:Scene3D, m:BaseMaterial){
	scene = sce;
	mtl=m;
}

var tmpPos=new Vec3();
var tmpQ=new Quaternion();

export function ZupPos2Yup(pos:Vec3,out:Vec3){
	zup2yupQ.vmult(pos,out);
}

export function ZupQuat2Yup(quat:Quaternion,out:Quaternion){
	zup2yupQ.mult(quat,out);
}

export function addZupBox(size:Vec3, mass:number, pos:Vec3, q:Quaternion){
	zup2yupQ.vmult(pos,tmpPos);	// 转到Yup
	zup2yupQ.mult(q,tmpQ);		// 转到Yup

	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x,size.y,size.z));
	scene.addChild(box);
	var rigidBody = box.addComponent(CannonBody) as CannonBody;
	var boxShape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
	rigidBody.phyBody.position.copy(tmpPos);
	rigidBody.phyBody.quaternion.copy(tmpQ);
    rigidBody.addShape(boxShape);
	rigidBody.setMass(mass);
	rigidBody.phyBody.aabbNeedsUpdate=true;	//TODO 这个怎么能自动实现
    return rigidBody;
}

export function addBox( size:Vec3, pos:Vec3, mass:number, phyMtl:PhyMtl, randr=false):CannonBody {
	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x,size.y,size.z));
    scene.addChild(box);
    box.meshRenderer.material = mtl;
    var transform = box.transform;
    var p = transform.position;
    p.setValue(pos.x, pos.y, pos.z);
    transform.position = p;
	//设置欧拉角
	if(randr){
	    var rotationEuler = transform.rotationEuler;
	    rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
	}

	var rigidBody = box.addComponent(CannonBody) as CannonBody;
	//rigidBody.phyBody.setScale(3,1,1);
    var boxShape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
    rigidBody.addShape(boxShape);
	rigidBody.setMass(mass);
	rigidBody.phyBody.material = phyMtl;
    return rigidBody;
}

export function addCapsule(r: f32, h: f32, x: f32, y: f32, z: f32,randr=false): CannonBody {
    var cap = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(r, h + r + r, 10, 10))) as MeshSprite3D;
    cap.meshRenderer.material = mtl;
    var transform = cap.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;
	//设置欧拉角
	if(randr){
		var rotationEuler = transform.rotationEuler;
		let rx = Math.random() * 360;
		let ry = Math.random() * 360;
		let rz = Math.random() * 360;
		rotationEuler.setValue(rx, ry, rz);
		transform.rotationEuler = rotationEuler;
	}

    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);

    var phy = cap.addComponent(CannonBody) as CannonBody;
    phy.addShape(new Capsule(r, h), new Vector3(), shapeq);
	phy.setMass(1);
	phy.setName('capsule')
    return phy;
}

export function addSphere(r: f32, x: f32, y: f32, z: f32): CannonBody {
	let sph = new MeshSprite3D(PrimitiveMesh.createSphere(r, 12, 12));
    scene.addChild(sph);
    sph.meshRenderer.material = mtl;
    var transform = sph.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;

	var phy = sph.addComponent(CannonBody) as CannonBody;
	//phy.phyBody.setScale(3,1,1);
    phy.addShape(new Sphere(r));
    phy.setMass(1);
    return phy;
}

export function addTetra(v0:Vec3, v1:Vec3, v2:Vec3, v3:Vec3){
    new ConvexPolyhedron([v0,v1,v2,v3],[[0,1,2],[0,2,3],[0,3,1],[1,2,3]]);
}

export interface PhyObj{
	name:string;
	dim:Vec3;
	pos:Vec3;
	quat:Quaternion;
	mass:number;
}

export function loadSce(rsce:Scene3D, mtl:Material, sce:PhyObj[],zup2yup:boolean){
	let newpos=new Vec3();
	sce.forEach(cbox=>{
		if(zup2yup){
			zup2yupQ.vmult(cbox.pos,newpos);
			let b = addBox(cbox.dim,newpos,cbox.mass,mtl,false);
			zup2yupQ.mult(cbox.quat,b.phyBody.quaternion);
			b.phyBody.aabbNeedsUpdate=true;	//TODO 这个怎么能自动实现
		}else{
			let b = addBox(cbox.dim,cbox.pos,cbox.mass,mtl,false);
			b.phyBody.quaternion.copy(cbox.quat);
			b.phyBody.aabbNeedsUpdate=true;
		}
	});
}

export function raycast(world:World, cam:Camera, cb:(pt:Vec3, norm:Vec3)=>void){
	let ray = new Ray(new Vector3(), new Vector3());
	cam.viewportPointToRay(new Vector2(Laya.stage.mouseX, Laya.stage.mouseY), ray);
	let len = 10000;
	let phyRay = new PhyRay();
	phyRay.from.set(ray.origin.x, ray.origin.y, ray.origin.z);
	phyRay.to.set(ray.origin.x+ray.direction.x * len, ray.origin.y+ray.direction.y * len, ray.origin.z+ray.direction.z * len);
	let options: hitworldOptions = { mode: RayMode.CLOSEST };
	if (phyRay.intersectWorld(world, options)) {
		let r = phyRay.result;
		cb(r.hitPointWorld, r.hitNormalWorld);
		//phyr.addPersistPoint( hitpt);
	}	
}