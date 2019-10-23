import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import {CannonBody} from "./layawrap/CannonBody";
import {Box} from "./shapes/Box";
import {Vec3} from "./math/Vec3";
import {Quaternion} from "./math/Quaternion";
import {Capsule} from "./shapes/Capsule";
import { Vector3 } from "laya/d3/math/Vector3";
import {Sphere} from "./shapes/Sphere";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import {Material as PhyMtl, Material} from "./material/Material";
import {ConvexPolyhedron} from "./shapes/ConvexPolyhedron";

var scene:Scene3D;
var mtl:BlinnPhongMaterial;

export function initDemo(sce:Scene3D, m:BlinnPhongMaterial){
	scene = sce;
	mtl=m;
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
    var boxShape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
    rigidBody.addShape(boxShape);
	rigidBody.setMass(mass);
	rigidBody.phyBody.material = phyMtl;
    return rigidBody;
}

export function addCapsule(r: f32, h: f32, x: f32, y: f32, z: f32,randr=true): CannonBody {
    var cap = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(r, h + r + r, 0, 0))) as MeshSprite3D;
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
	let transQ = new Quaternion();
	transQ.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
	let newpos=new Vec3();
	sce.forEach(cbox=>{
		if(zup2yup){
			transQ.vmult(cbox.pos,newpos);
			let b = addBox(cbox.dim,newpos,cbox.mass,mtl,false);
			transQ.mult(cbox.quat,b.phyBody.quaternion);
		}else{
			let b = addBox(cbox.dim,cbox.pos,cbox.mass,mtl,false);
			b.phyBody.quaternion.copy(cbox.quat);
		}
	});
}