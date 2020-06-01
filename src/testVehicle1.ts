import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { addBox, JSONLoader, mouseDownEmitObj, nodeProxy, ZupPos2Yup, ZupQuat2Yup, loadVoxel, loadVoxTest, createVoxelBox, addSphere } from "./DemoUtils";
import { CannonBody } from "./layawrap/CannonBody";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender, UIPlane } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Quaternion as phyQuat } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Car, carData } from "./objects/Car";
import { Box } from "./shapes/Box";
import { getGamePadStatus } from "./layawrap/ctrls/GamePad";
import { ttt, updateStatus } from "./layawrap/ctrls/GamePadTest";
import { Vector3 } from "laya/d3/math/Vector3";
import { Voxel } from "./shapes/Voxel";
import { SparseVoxData } from "./shapes/VoxelData";
import { Body } from "./objects/Body";
import { World } from "./world/World";
import { Sphere } from "./shapes/Sphere";
import { Narrowphase } from "./world/Narrowphase";
import { ContactEquation } from "./equations/ContactEquation";
import { FrictionEquation } from "./equations/FrictionEquation";
import { test_sphere_vox } from "./testCase";


// TEST

//test_sphere_vox();
// TEST

/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;

let phymtl1 = new Material("1",1,0);
let phymtl2 = new Material('2',1,0);
let phymtl3 = new Material('3',1,0);
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

/*
            var groundMaterial = new CANNON.Material("groundMaterial");
            var wheelMaterial = new CANNON.Material("wheelMaterial");
            var wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
                friction: 0.3,
                restitution: 0,
                contactEquationStiffness: 1000
            });

            // We must add the contact materials to the world
            world.addContactMaterial(wheelGroundContactMaterial);

*/

class Dashboard extends Sprite{
	speed=0;
	force=0;
}

/*
var wheeloffq = new phyQuat();
wheeloffq.setFromAxisAngle(new Vec3(0,0,1),Math.PI/2);
*/
var lastTarget=new Vec3();

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	// phyworld
	phyworld.world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, phyworld.world);
	world.world.defaultContactMaterial.friction=0.6;
	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

function testGround() {
	world.world.gravity.set(0, -11, 0);
	let p = addBox(new Vec3(10000, 100, 10000), new Vec3(0, -50, 0), 0, phymtl1);
	/*
	let plane = new Sprite3D();
    let planephy = plane.addComponent(CannonBody) as CannonBody;
    planephy.setMaterial(phymtl1);
    planephy.setName('plane');
    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planephy.addShape(new Plane(), new Vector3(), shapeq);  // laya的plane是向上(y)的，cannon的plane是向前（后？）的
	planephy.setMass(0);
	*/

}

let car1:Car;

// 加载器
class NodeLoaderProxy implements nodeProxy{
	rnode:CannonBody;
	zup=true;
	constructor(){
		this.rnode=new CannonBody();
		this.rnode._onAdded();
	}
	
	getRealNode() {
		return this.rnode;
	}

	setProp(name: string, value: any, node: any, loader: JSONLoader): void {
		var rigidBody = this.rnode;//new CannonBody();

		//rigidBody.phyBody.material = phymtl;
		switch(name){
			case 'name':
				rigidBody.setName(value);
				break;
			case 'dim':
				let boxShape = new Box(new Vec3(value.x / 2, value.y / 2, value.z / 2));
				rigidBody.addShape(boxShape);
				break;
			case 'pos':
				let pos = new Vec3(value.x,value.y,value.z);
				ZupPos2Yup(pos,pos);
				rigidBody.phyBody.position.copy(pos);
				break;
			case 'quat':
				let quat = new phyQuat(value.x,value.y,value.z,value.w);
				ZupQuat2Yup(quat,quat);
				rigidBody.phyBody.quaternion.copy(quat);
				break;
			case 'mass':
				rigidBody.setMass(value);
				break;
		}
	}
	setPropEnd(node: any, loader: JSONLoader): void {
		var rigidBody = this.rnode
		rigidBody.phyBody.aabbNeedsUpdate=true
		rigidBody.phyBody.material= phymtl2;
		let phypos = rigidBody.phyBody.position;
		let phyquat = rigidBody.phyBody.quaternion;

		// 调试渲染模型
		let box = new MeshSprite3D(PrimitiveMesh.createBox(node.dim.x,node.dim.y,node.dim.z));
		sce3d.addChild(box);
		box.meshRenderer.material = mtl1;
		var transform = box.transform;
		var p = transform.position;
		p.setValue(phypos.x, phypos.y, phypos.z);
		transform.position = p;
		let quat = transform.rotation;
		quat.x = phyquat.x; quat.y=phyquat.y; quat.z=phyquat.z; quat.w=phyquat.w;
		transform.rotation=quat;
		this.rnode.renderobj=box;
	}
}
	
var useGamePad=false;
export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 10;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);
	let sceobj =
	[{"name": "Cube", "dim": {"x": 20.0, "y": 40.0, "z": 0.20000004768371582}, "pos": {"x": -9.5367431640625e-07, "y": 2.384185791015625e-07, "z": 2.384185791015625e-07}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -10.583667755126953, "y": 1.719085931777954, "z": 0.19451212882995605}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.002", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -12.58366584777832, "y": 1.719085931777954, "z": 0.49451208114624023}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.004", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -14.58366584777832, "y": 1.719085931777954, "z": 0.7945119142532349}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.005", "dim": {"x": 2.0, "y": 8.0, "z": 0.30000001192092896}, "pos": {"x": -16.583667755126953, "y": 1.719085931777954, "z": 1.0945121049880981}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.007", "dim": {"x": 21.156166076660156, "y": 2.0, "z": 22.843351364135742}, "pos": {"x": 0.7932448387145996, "y": 29.810110092163086, "z": 1.923642873764038}, "quat": {"x": -0.6076875925064087, "y": -2.8394364189311764e-17, "z": -1.2932333602556147e-17, "w": 0.7941761612892151}, "mass": 0}, {"name": "Cube.010", "dim": {"x": 39.56965637207031, "y": 46.535789489746094, "z": 2.0}, "pos": {"x": -36.34748840332031, "y": -1.1900715827941895, "z": 0.12122726440429688}, "quat": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}, "mass": 0}, {"name": "Cube.011", "dim": {"x": 2.0, "y": 7.904061317443848, "z": 2.0}, "pos": {"x": -28.82550811767578, "y": 20.522964477539062, "z": 5.052074909210205}, "quat": {"x": -0.7062811851501465, "y": -0.0, "z": 0.0, "w": 0.7079314589500427}, "mass": 0}, {"name": "Cube.012", "dim": {"x": 10.628738403320312, "y": 6.746131420135498, "z": 2.0}, "pos": {"x": -11.732584953308105, "y": -10.690053939819336, "z": -0.7721989154815674}, "quat": {"x": 0.0, "y": 0.07997595518827438, "z": 0.0, "w": 0.9967967867851257}, "mass": 0}, {"name": "Cube.013", "dim": {"x": 21.156166076660156, "y": 2.000000238418579, "z": 22.843355178833008}, "pos": {"x": 0.7932448387145996, "y": 50.98167037963867, "z": 4.678845405578613}, "quat": {"x": -0.7063905000686646, "y": -5.2919352835390326e-17, "z": -2.6763240121973548e-17, "w": 0.7078224420547485}, "mass": 0}, {"name": "Cube.014", "dim": {"x": 21.156166076660156, "y": 2.000000238418579, "z": 22.84335708618164}, "pos": {"x": 0.7932448387145996, "y": 72.1532211303711, "z": 1.0535789728164673}, "quat": {"x": -0.8072583079338074, "y": -8.069866853459951e-17, "z": -4.249768775422248e-17, "w": 0.5901987552642822}, "mass": 0}]

	let loader = new JSONLoader();
	loader.loadJSON(sceobj,(l:JSONLoader,node:any)=>{
		if( node.name )
			return new NodeLoaderProxy();
		return null;
	});

	testGround();

	//loadVoxel('res/house/house1.obj',new Vec3(-37, -0.5, 45));//, undefined, new Vec3(-1,-1,1));
	loadVoxel('res/body1.obj',new Vec3(-37, -0.5, 45), undefined, new Vec3(.1,.2,.1));//, undefined, new Vec3(-1,-1,1));
 
	createVoxelBox(100,100,100,0.01, new Vec3(0,0,0)); 
	addSphere(0.5,0.5,2,0.5);

	//loadVoxTest('res/test/data.json');

	if(useGamePad)
		ttt();
	//createJoint();
	let kmhSp = new Sprite();
	let uip = new UIPlane(kmhSp);
	uip.transform.scale=new Vector3(5,1,1)
	uip.transform.rotationEuler = new Vector3(-90,0,0);
	sce3d.addChild(uip);
	
	car1 = new Car(sce3d,world.world);
	car1.parse(carData,null);
	car1.enable();
	car1.phyCar.chassisBody.position.set(10,1,10);
	car1.showTrack=true;
	car1.onUpdatePoseEnd=function(pos:Vec3,quat:phyQuat){
		let speed = car1.getSpeed();
		kmhSp.graphics.clear();
		kmhSp.graphics.drawRect(0,0,150,30,null,'blue',2);
		kmhSp.graphics.fillText('Speed:'+speed.toFixed(2),0,0,'20px Arial', 'red', 'left');
		uip.buildTex();
		let uipos = uip.transform.position;
		uipos.setValue(pos.x,pos.y+2,pos.z);
		uip.transform.position=uipos;

		// 控制摄像机
		/*
		lastTarget.vadd(pos,lastTarget);
		lastTarget.scale(0.5,lastTarget);
		camctr.target.setValue(lastTarget.x,lastTarget.y,lastTarget.z);
		camctr.updateCam(true);
		*/

		if(useGamePad){
			let acck=0;
			let isR=false;
			updateStatus((v)=>{
				car1.steer(-v*Math.PI/4)
			},
			(v)=>{
				//console.log('v',v);
				if(v<0.01){
					if(v<0){
						// 油门
						acck=-v;
						if(isR){
							car1.reversing(acck);
						}else{
							car1.accel(acck);
						}
						let phy = car1.phyCar;
						phy.setBrake(0,0);		
						phy.setBrake(0,1);
						phy.setBrake(0,2);
						phy.setBrake(0,3);
		
					}
				}else{
					// 刹车
					let phy = car1.phyCar;
					let vv = 1000*v;
					phy.setBrake(vv,0);		
					phy.setBrake(vv,1);
					phy.setBrake(vv,2);
					phy.setBrake(vv,3);
				}
			},()=>{
				isR=false;
			}, ()=>{
				isR=true;
			}
			);
		}
	}
	

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY, cam.camera);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		car1.onkeyEvent(e,true);
	});

	Laya.stage.on(Event.KEY_UP, null, (e: Event) => {
		car1.onkeyEvent(e,false);
	});

	//testLift();
	//testConveyorbelt();
	//loadObj(oo,world.world);
	setInterval(() => {
		//console.log('speed=',car1.phyCar.currentVehicleSpeedKmHour,'Km/H');
	}, 1000);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}

