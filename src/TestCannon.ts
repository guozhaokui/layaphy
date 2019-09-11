import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import CannonBody from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { PhyRender } from "./layawrap/LayaDebugRender";
import ContactMaterial from "./material/ContactMaterial";
import Material from "./material/Material";
import Quaternion from "./math/Quaternion";
import Vec3 from "./math/Vec3";
import Box from "./shapes/Box";
import Capsule from "./shapes/Capsule";
import Plane from "./shapes/Plane";
import Sphere from "./shapes/Sphere";
import { Voxel } from "./shapes/Voxel";

let scene:Scene3D;
let mtl:BlinnPhongMaterial;
export function testCannon(renderScene:Scene3D, plane:MeshSprite3D, rmtl:BlinnPhongMaterial) {
	scene=renderScene;
	mtl=rmtl;
    let phyworld = scene.addComponent(CannonWorld) as CannonWorld;
    // phyworld
    //phyworld.world.gravity.set(0,0,0);

    phyworld.world && new PhyRender(scene, phyworld.world);

    let phymtl1 = new Material();
    let phymtl2 = new Material();
    let phymtl3 = new Material();
    let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 0, 0);
    let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 0, 1);
    phyworld.world && phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);

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

    let bb = addBox(0.2,14,3,0,12,0);
	addBox(1,1,1,10,2,0);
	
	addSphere(1,2,2,2);
 
    let y = 5;
    for (let i = 0; i < 100; i++) {
        //addBox(.1,.1,.1,Math.random()*10,5,Math.random()*10);
        addCapsule(0.2, 9, 0, y, 0);
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


function addBox(sx: number, sy: number, sz: number, x: number, y: number, z: number):CannonBody {
    var box = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sx, sy, sz))));
    box.meshRenderer.material = mtl;
    var transform = box.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;
    //设置欧拉角
    var rotationEuler = transform.rotationEuler;
    rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
    //transform.rotationEuler = rotationEuler;

    var rigidBody = box.addComponent(CannonBody) as CannonBody;
    var boxShape = new Box(new Vec3(sx / 2, sy / 2, sz / 2));
    rigidBody.addShape(boxShape);
    rigidBody.setMass(1);
    return rigidBody;
}

function addCapsule(r: f32, h: f32, x: f32, y: f32, z: f32): CannonBody {
    var cap = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(r, h + r + r, 0, 0))) as MeshSprite3D;
    cap.meshRenderer.material = mtl;
    var transform = cap.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;
    //设置欧拉角
    var rotationEuler = transform.rotationEuler;
    let rx = Math.random() * 360;
    let ry = Math.random() * 360;
    let rz = Math.random() * 360;
    rotationEuler.setValue(rx, ry, rz);
    transform.rotationEuler = rotationEuler;

    let shapeq = new Quaternion();
    //shapeq.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);

    var phy = cap.addComponent(CannonBody) as CannonBody;
    phy.addShape(new Capsule(r, h), new Vector3(), shapeq);
    phy.setMass(11);
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