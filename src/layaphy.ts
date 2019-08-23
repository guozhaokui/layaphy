import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Vector4 } from "laya/d3/math/Vector4";
import { LCPhyWorld } from "./layawrap/LCPhyWorld";
import LCPhyComponent from "./layawrap/LCPhyComponent";
import Plane from "./shapes/Plane";
import Vec3 from "./math/Vec3";
import Box from "./shapes/Box";
import Quaternion from "./math/Quaternion";
import Capsule from "./shapes/Capsule";
import Sphere from "./shapes/Sphere";

//TEST

let scene:Scene3D;
let mtl1:BlinnPhongMaterial;

Laya3D.init(1920,1080);
scene = Laya.stage.addChild( new Scene3D() ) as Scene3D;

let phy = scene.addComponent( LCPhyWorld) as LCPhyWorld;

let mtl2 = new BlinnPhongMaterial();
//加载纹理资源
Texture2D.load("res/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
    mtl2.albedoTexture = tex;
}));

var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
camera.transform.translate(new Vector3(0, 6, 19.5));
camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
//camera.addComponent(CameraMoveScript);
//camera.clearColor = null;

//light
var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
directionLight.color = new Vector3(0.6, 0.6, 0.6);
//设置平行光的方向
var mat: Matrix4x4 = directionLight.transform.worldMatrix;
mat.setForward(new Vector3(-1.0, -1.0, -1.0));
directionLight.transform.worldMatrix = mat;

var plane: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10))));
var planeMtl = new BlinnPhongMaterial();
Texture2D.load("res/grass.png", Handler.create(this, function (tex: Texture2D): void {
    planeMtl.albedoTexture = tex;
}));
//设置纹理平铺和偏移
var tilingOffset: Vector4 = planeMtl.tilingOffset;
tilingOffset.setValue(5, 5, 0, 0);
planeMtl.tilingOffset = tilingOffset;
//设置材质
plane.meshRenderer.material = planeMtl;

let planephy = plane.addComponent(LCPhyComponent) as LCPhyComponent;

let shapeq = new Quaternion();
shapeq.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
planephy.addShape( new Plane(), new Vector3(), shapeq);  // laya的plane是向上的，cannon的plane是向前（后？）的
planephy.setMass(0);
//planephy.phyBody.quaternion.setFromAxisAngle( new Vec3(1,0,0),0);
/*
let y=5;
for(let i=0; i<100; i++){
    //addBox(.1,.1,.1,Math.random()*10,5,Math.random()*10);
    addBox(.1,.1,.1,0,y,0);
    y+=0.22;
}
*/

//addCapsule(1,1,2,2,2);

addSphere(1,2,2,4);

/*
var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
planeStaticCollider.colliderShape = new BoxColliderShape(10, 0, 10);
planeStaticCollider.friction = 2;
planeStaticCollider.restitution = 0.3;
*/

function  addBox(sx:number, sy:number, sz:number, x:number, y:number,z:number){
    var box = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sx, sy, sz))));
    box.meshRenderer.material = mtl2;
    var transform = box.transform;
    var pos = transform.position;
    pos.setValue(x,y,z);
    transform.position = pos;
    //设置欧拉角
    var rotationEuler = transform.rotationEuler;
    rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
    //transform.rotationEuler = rotationEuler;

    var rigidBody = box.addComponent(LCPhyComponent) as LCPhyComponent;
    var boxShape = new Box(new Vec3(sx,sy,sz));
    rigidBody.addShape(boxShape);
    rigidBody.setMass(1);
}

function addCapsule(r:f32, h:f32, x:f32, y:f32, z:f32):void{
    var cap = scene.addChild(new MeshSprite3D( PrimitiveMesh.createCapsule(r,h))) as MeshSprite3D;
    cap.meshRenderer.material = mtl2;
    var transform = cap.transform;
    var pos = transform.position;
    pos.setValue(x,y,z);
    transform.position = pos;

    var phy = cap.addComponent(LCPhyComponent) as LCPhyComponent;
    phy.addShape( new Capsule(r,h));
    phy.setMass(1);
}

function addSphere(r:f32, x:f32, y:f32, z:f32):void{
    var sph = scene.addChild(new MeshSprite3D( PrimitiveMesh.createSphere(r,12,12))) as MeshSprite3D;
    sph.meshRenderer.material = mtl2;
    var transform = sph.transform;
    var pos = transform.position;
    pos.setValue(x,y,z);
    transform.position = pos;

    var phy = sph.addComponent(LCPhyComponent) as LCPhyComponent;
    phy.addShape( new Sphere(r) );
    phy.setMass(1);
}