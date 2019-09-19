import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import CannonBody from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { PhyRender } from "./layawrap/PhyRender";
import ContactMaterial from "./material/ContactMaterial";
import Material from "./material/Material";
import Quaternion from "./math/Quaternion";
import Vec3 from "./math/Vec3";
import Box from "./shapes/Box";
import Capsule from "./shapes/Capsule";
import Plane from "./shapes/Plane";
import Sphere from "./shapes/Sphere";
import { Voxel } from "./shapes/Voxel";
import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import Body from "./objects/Body";

let PI = Math.PI;
let scene:Scene3D;
let mtl:BlinnPhongMaterial;
var stx=0;
var sty=0;
let caps:Body[]=[];
export function testCannon(renderScene:Scene3D, plane:MeshSprite3D, rmtl:BlinnPhongMaterial) {
	scene=renderScene;
	mtl=rmtl;
    let phyworld = scene.addComponent(CannonWorld) as CannonWorld;
    // phyworld
    //phyworld.world.gravity.set(0,0,0);

    (window as any).phyr = new PhyRender(scene, phyworld.world);

    let phymtl1 = new Material();
    let phymtl2 = new Material();
    let phymtl3 = new Material();
    let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0, 0);
    let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 1);
    phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);

    let planephy = plane.addComponent(CannonBody) as CannonBody;
    planephy.setMaterial(phymtl1);
    planephy.setName('plane');
    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
	planephy.setMass(0);
    //planephy.phyBody.position.set(10,0,0);
    //planephy.phyBody.quaternion.setFromAxisAngle( new Vec3(1,0,0),0);
    /*
    let y=5;
    for(let i=0; i<100; i++){
        //addBox(.1,.1,.1,Math.random()*10,5,Math.random()*10);
        addBox(.1,.1,.1,0,y,0);
        y+=0.22;
    }
    */
   /*
    let PI = Math.PI;
    let bodyQ = new Quaternion();
    let cap = addCapsule(0.2, 8, 2, 8, 2);

    //cap.setVel(1,0,-1);

    Laya.stage.on(Event.MOUSE_DOWN, null, () => {
        let rx = Math.random() * 2 * PI;
        let ry = Math.random() * 2 * PI;
        let rz = Math.random() * 2 * PI;
        console.log('rot', rx, ry, rz)

        bodyQ.setFromEuler(rx, ry, rz);
        cap.phyBody.quaternion = bodyQ;
        cap.phyBody.position = new Vec3(0, 10, 0);
        cap.phyBody.velocity.set(0, 0, 0);
        cap.phyBody.wakeUp();
    });
    */

    //let bb = addBox(0.2,14,3,0,12,0);
	addBox(1,1,1,1,1,0);
	
	let c1 = addCapsule(1, 1,  -1,1, 0,  false);
	//let c1 = addBox(2,4,2, 1,4,0, false);
	c1.phyBody.allowSleep=false;
	//c1.phyBody.applyForce(new Vec3(0,0,-421), new Vec3(2,1,0));
	//let c2 = addCapsule(0.2, 4, 3.15,1.2, 0,false);
	//c1.phyBody.velocity.z=-0.1;
	//c2.phyBody.allowSleep=false;
	//c2.phyBody.quaternion.setFromAxisAngle(new Vec3(0,1,0),Math.PI/2);
    Laya.stage.on(Event.MOUSE_DOWN, null, (e:{stageX:number,stageY:number}) => {
		stx=e.stageX;
		sty=e.stageY;
		let r = Math.random;
		caps.forEach( b=>{
			//b.position.set(0,2,0);
			//b.velocity.set(0,0,0);
			//b.angularVelocity.set(0,0,0);
		})

		//let s = addSphere(1,0,1,0);
		//s.phyBody.velocity.set(0,0,-2);
	});

	Laya.stage.on(Event.MOUSE_MOVE, null, (e:{stageX:number,stageY:number})=>{
	});

    let y = 5;
    for (let i = 0; i < 0; i++) {
        //addBox(.1,10,.1,Math.random()*10,5,Math.random()*10,true);
		let c = addCapsule(.5, 16, 0, y, 0);
		c.phyBody.allowSleep=false;
		caps.push(c.phyBody);
        y += 0.22;
    }
    /*
    let sph = addSphere(1,2,2,4);
    sph.setVel(0,0,0);
    sph.setMaterial(phymtl2);
    sph.setName('sph1');
    
    let sph1 = addSphere(1,5,2,4);
    sph1.setVel(-1,0,0);
    sph.setMaterial(phymtl3);
    sph.setName('sph2');
    */

    /*
    var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
    planeStaticCollider.colliderShape = new BoxColliderShape(10, 0, 10);
    planeStaticCollider.friction = 2;
    planeStaticCollider.restitution = 0.3;
    */
}


function addBox(sx: number, sy: number, sz: number, x: number, y: number, z: number, randr=false):CannonBody {
    var box = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sx, sy, sz))));
    box.meshRenderer.material = mtl;
    var transform = box.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;
	//设置欧拉角
	if(randr){
	    var rotationEuler = transform.rotationEuler;
	    rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
	}

    var rigidBody = box.addComponent(CannonBody) as CannonBody;
    var boxShape = new Box(new Vec3(sx / 2, sy / 2, sz / 2));
    rigidBody.addShape(boxShape);
    rigidBody.setMass(1);
    return rigidBody;
}

function addCapsule(r: f32, h: f32, x: f32, y: f32, z: f32,randr=true): CannonBody {
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

function addSphere(r: f32, x: f32, y: f32, z: f32): CannonBody {
    var sph = scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(r, 12, 12))) as MeshSprite3D;
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

function addVoxel(x:f32,y:f32,z:f32, vox:Voxel):void{

}