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
import { initDemo } from "./DemoUtils";
import { loadBullet } from "./layawrap/bullet/bulletLoader";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import {Quaternion} from "./math/Quaternion";
import { testBullet } from "./TestBullet";
import { DefaultMaterial } from "./layawrap/debugger/DefaultMtl";
import { loadEnvTexture, loadLUTTex } from "./layawrap/debugger/envTexMgr";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Main } from "./testGridMgr";
//import { Main } from "./testSolver";
//import { Main } from "./TestTriMesh";
//import { Main } from "./testEditor";
//import { Main } from "./testVehicle1";
//import { Main } from "./testSphereVoxErr";
//import { Main } from "./testVehicle";
//import { Main } from "./testGridBroad";
//import { Main } from "./TestEPA";
//import { Main } from "./TestCharCtrl";
//import { Main } from "./testBoxError";
//import { Main } from "./testDomino";
//import { Main } from "./TestSpider";
//import { Main } from "./TestInBrowser";
//import { Main } from "./TestHeightField";
//import { Main } from "./testJoint";
//import { Main } from "./testPlanetGravity";
//import { Main } from "./testPush";
//import { Main } from "./testVoxel";
//let PhyWorld: typeof BtWorld | typeof CannonWorld;
//let PhyBody: typeof BtBody | typeof CannonBody;
// Determine quaternion from roll, pitch, and yaw euler angles: http://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
// just using roll and pitch here


function EulerToQuat(phi:number, theta:number, psi:number, q:Quaternion) {
	var c = Math.cos, s = Math.sin, f=phi, t=theta, p=psi;		
	var p2 = p*0.5, t2 = t*0.5, f2=f*0.5;
	q.w = c(f2)*c(t2)*c(p2)+s(f2)*s(t2)*s(p2);
	q.x = s(f2)*c(t2)*c(p2)-c(f2)*s(t2)*s(p2);
	q.y = c(f2)*s(t2)*c(p2)+s(f2)*c(t2)*s(p2);
	q.z = c(f2)*c(t2)*s(p2)-s(f2)*s(t2)*c(p2);
}

// http://www.gamedev.net/topic/423462-rotation-difference-between-two-quaternions/
// to compute the angular velocity to make correct collision resolution

function QuatToAxisAngle(q:Quaternion) {
	var angle = 2*Math.acos(q.w), scale = 1.0/Math.sqrt(1.0-q.w*q.w);
	var x = q.x*scale;
	var y = q.y*scale;
	var z = q.z*scale;
	return [x,y,z,angle];
}

function QuatToEuler(q:Quaternion) {
	var f,t,p;
	f = Math.atan2(2*(q.w*q.x+q.y*q.z),1-2*(q.x*q.x+q.y*q.y));
	t = Math.asin(2*(q.w*q.y-q.z*q.x));
	p = Math.atan2(2*(q.w*q.z+q.x*q.y),1-2*(q.y*q.y+q.z*q.z));
	return [f,t,p];
}

//TEST
//let ret = GreedyMesh(new Array(8).fill(1),[2,2,2]);
//debugger
//TEST

let scene: Scene3D;
//let mtl1:BlinnPhongMaterial;
Laya3D.init(window.innerWidth, window.innerHeight);
scene = Laya.stage.addChild(new Scene3D()) as Scene3D;
let mtl2 = new BlinnPhongMaterial();
let stdmtl = new DefaultMaterial();

//加载纹理资源
Texture2D.load("res/gray.jpg", Handler.create(null, function (tex: Texture2D): void {
    mtl2.albedoTexture = tex;
}));

loadEnvTexture('res/env/default/env.mipmaps', (t)=>{
	let texEnv=t;
	let texLUT = loadLUTTex();
	stdmtl.setEnvTexture(texEnv);
	stdmtl.setLUTTexture(texLUT);
	let envdiffdt = [0.28129690885543823,0,0,0,-0.3282267153263092,-0.1073296070098877,0,0,-0.29809144139289856,0.13647188246250153,-0.17396731674671173,0,-0.5436494946479797,0.18786616623401642,0.2717423141002655,0.5554966926574707,0.2510770261287689,0,0,0,-0.295642226934433,-0.08785344660282135,0,0,-0.2755483090877533,0.12092982232570648,-0.16322359442710876,0,-0.5187899470329285,0.1655164659023285,0.3213203251361847,0.5639563798904419,0.17064285278320312,0,0,0,-0.22071118652820587,-0.04934860020875931,0,0,-0.21280556917190552,0.08689119666814804,-0.12129425257444382,0,-0.40946751832962036,0.11174142360687256,0.36054936051368713,0.5101194381713867];
	//u_roughness_metaless_hdrexp.set([0, 0, 1]);
	let matr = new Matrix4x4();
	let matg = new Matrix4x4();
	let matb = new Matrix4x4();
	matr.elements.set(envdiffdt.slice(0, 16));
	matg.elements.set( envdiffdt.slice(16, 32));
	matb.elements.set( envdiffdt.slice(32, 48));
	stdmtl.setSPHValue(matr,matg,matb);
})


var camera = (<Camera>scene.addChild(new Camera(0, 1, 10000)));
camera.transform.translate(new Vector3(0, 6, 19.5));
camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
let camctrl = camera.addComponent(MouseCtrl1) as MouseCtrl1;
camera.clearColor=new Vector4(0,0,0,0);
camctrl.initCamera(new Vector3(0, 0, 0), new Vector3(-15, 0, 0), 12);
//camera.addComponent(CameraMoveScript);
//camera.clearColor = null;

//light
var directionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
directionLight.color = new Vector3(0.6, 0.6, 0.6);
//设置平行光的方向
var mat = directionLight.transform.worldMatrix;
mat.setForward(new Vector3(-1.0, -1.0, 1.0));
directionLight.transform.worldMatrix = mat;

let plane = new MeshSprite3D(PrimitiveMesh.createPlane(100, 100, 10, 10));
//scene.addChild(plane);
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


if(1){
	initDemo(scene,mtl2);
	//initDemo(scene,stdmtl);
	//testCannon(scene,plane,mtl2);
	Main(scene,mtl2,camctrl);
	
}else{
	loadBullet('./bullet1.wasm').then((bullet:BulletExport) => {
		testBullet(scene,plane,mtl2,bullet);
	});
}
