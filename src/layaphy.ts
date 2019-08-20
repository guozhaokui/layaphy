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

//TEST

class Main{

}
let scene:Scene3D;
let mtl1:BlinnPhongMaterial;

Laya3D.init(1920,1080);
scene = Laya.stage.addChild( new Scene3D() ) as Scene3D;

var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
camera.transform.translate(new Vector3(0, 6, 9.5));
camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
//camera.addComponent(CameraMoveScript);
camera.clearColor = null;

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

/*
var planeStaticCollider: PhysicsCollider = plane.addComponent(PhysicsCollider);
planeStaticCollider.colliderShape = new BoxColliderShape(10, 0, 10);
planeStaticCollider.friction = 2;
planeStaticCollider.restitution = 0.3;
*/
