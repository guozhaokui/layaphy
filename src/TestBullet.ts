import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { BtBody } from "./layawrap/bullet/BulletBody";
import { BtWorld } from "./layawrap/bullet/BulletWorld";

let scene:Scene3D;
let mtl:BlinnPhongMaterial;
let gBullet:BulletExport;
//////////////////////////////////////////////////
function btAddBox(sx: number, sy: number, sz: number, x: number, y: number, z: number) {
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

    var rigidBody = box.addComponent(BtBody) as BtBody;
    rigidBody.setShape( gBullet.createBox(sx/2,sy/2,sz/2,1));
}

export function testBullet(renderSce:Scene3D,plane:MeshSprite3D, rmtl:BlinnPhongMaterial, bullet:BulletExport){
	mtl = rmtl;
	gBullet=bullet;
    let phyworld = scene.addComponent(BtWorld);

    let planephy = plane.addComponent(BtBody) as BtBody ;
    planephy.setShape( gBullet.createBox(100,10,100,0));
    /*
    planephy.setName('plane');
    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
    planephy.setMass(0);
    */
   btAddBox(1,1,1,0,10,0);
}