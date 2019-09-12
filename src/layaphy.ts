import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Laya3D } from "Laya3D";
import { loadBullet } from "./layawrap/bullet/bulletLoader";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { VoxelMaterial } from "./layawrap/debugger/VoxelRender/VoxelMtl";
import { VoxelSprite } from "./layawrap/debugger/VoxelRender/VoxelSprite";
import { hashSparseVox, SparseVoxData } from "./shapes/Voxel";
import { testBullet } from "./TestBullet";
import { testCannon } from "./TestCannon";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";

//let PhyWorld: typeof BtWorld | typeof CannonWorld;
//let PhyBody: typeof BtBody | typeof CannonBody;



let scene: Scene3D;
//let mtl1:BlinnPhongMaterial;
Laya3D.init(1920, 1080);
scene = Laya.stage.addChild(new Scene3D()) as Scene3D;
let mtl2 = new BlinnPhongMaterial();
//加载纹理资源
Texture2D.load("res/rocks.jpg", Handler.create(null, function (tex: Texture2D): void {
    mtl2.albedoTexture = tex;
}));

var camera = (<Camera>scene.addChild(new Camera(0, 1, 1000)));
camera.transform.translate(new Vector3(0, 6, 19.5));
camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
let camctrl = camera.addComponent(MouseCtrl1) as MouseCtrl1;
camctrl.initCamera(new Vector3(0, 0, 0), new Vector3(-15, 0, 0), 12);
//camera.addComponent(CameraMoveScript);
//camera.clearColor = null;

//light
var directionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
directionLight.color = new Vector3(0.6, 0.6, 0.6);
//设置平行光的方向
var mat = directionLight.transform.worldMatrix;
mat.setForward(new Vector3(-1.0, -1.0, -1.0));
directionLight.transform.worldMatrix = mat;

var plane = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(100, 100, 10, 10))));
var planeMtl = new BlinnPhongMaterial();
Texture2D.load("res/grass.png", Handler.create(null, function (tex: Texture2D): void {
    planeMtl.albedoTexture = tex;
}));
//设置纹理平铺和偏移
var tilingOffset: Vector4 = planeMtl.tilingOffset;
tilingOffset.setValue(5, 5, 0, 0);
planeMtl.tilingOffset = tilingOffset;
//设置材质
plane.meshRenderer.material = planeMtl;

/*
显示voxel
VoxelMaterial.initShader();
let vox = new VoxelSprite();
scene.addChild(vox);
*/

let m2v = new Mesh2Voxel();
m2v.loadObj('res/house/house1.obj',0.5,(voxdata:SparseVoxData)=>{
    let ret = hashSparseVox(voxdata);
    let s = 0;
    ret.forEach( v=>{
        if(v) s++;
    })
    console.log('length=',ret.length, 'space=', ret.length-s);
    //debugger;
});

if(1){
	testCannon(scene,plane,mtl2);
}else{
	loadBullet('./bullet1.wasm').then((bullet:BulletExport) => {
		testBullet(scene,plane,mtl2,bullet);
	});
}
