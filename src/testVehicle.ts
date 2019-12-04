import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { ConeTwistConstraint } from "./constraints/ConeTwistConstraint";
import { HingeConstraint } from "./constraints/HingeConstraint";
import { PointToPointConstraint } from "./constraints/PointToPointConstraint";
import { addBox, addSphere, addZupBox, ZupPos2Yup, ZupQuat2Yup, loadObj } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Mat3 } from "./math/Mat3";
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Body } from './objects/Body';

var oo = 
[{"name": "Cube", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.0, "y": 0.0, "z": 0.0}, "quat": {"x": 0.0, "y": 0.0, "z": -0.36059334874153137, "w": 0.9327231645584106}, "mass": 1.0}, {"name": "Cube.001", "dim": {"x": 2.0, "y": 2.0, "z": 2.0}, "pos": {"x": 0.0, "y": 0.0, "z": 2.2614493370056152}, "quat": {"x": 0.0, "y": 0.0, "z": -0.36059334874153137, "w": 0.9327231645584106}, "mass": 1.0}, {"name": "Empty", "pos": {"x": 0.0, "y": 0.0, "z": 1.1762117147445679}, "quat": {"x": -0.7088689208030701, "y": 0.0, "z": 0.0, "w": 0.7053402066230774}, "type": "C_HINGE", "A": "Cube.001", "B": "Cube"}]
;


/**
 * 测试盒子可以被推走，被抬起
 * 测试缩放形状
 */

var sce3d: Scene3D;
var mtl1: BlinnPhongMaterial;
var world: CannonWorld;
var camctr: MouseCtrl1;

let phymtl1 = new Material();
let phymtl2 = new Material();
let phymtl3 = new Material();
let cmtl1 = new ContactMaterial(phymtl1, phymtl2, 1, 0);
let cmtl2 = new ContactMaterial(phymtl1, phymtl3, 1, 0);

function initPhy(scene: Scene3D) {
	let phyworld = world = scene.addComponent(CannonWorld) as CannonWorld;
	// phyworld
	phyworld.world.gravity.set(0, 0, 0);

	(window as any).phyr = new PhyRender(scene, phyworld.world);

	phyworld.world.addContactMaterial(cmtl1).addContactMaterial(cmtl2);
}

function rand(a: number, b: number) {
	let d = b - a;
	return Math.random() * d + a;
}

function testGround() {
	world.world.gravity.set(0, -11, 0);
	let p = addBox(new Vec3(100, 100, 100), new Vec3(0, -53, 0), 0, phymtl1);
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

function mouseDownEmitObj(scrx: number, scry: number) {
	let worlde = camctr.camera.transform.worldMatrix.elements;
	let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
	let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

	let ray = new Ray(new Vector3(), new Vector3());
	camctr.camera.viewportPointToRay(new Vector2(scrx, scry), ray);
	stpos.set(ray.origin.x, ray.origin.y, ray.origin.z);
	dir.set(ray.direction.x, ray.direction.y, ray.direction.z);

	let sp = addSphere(0.3, stpos.x, stpos.y, stpos.z);
	//let sp = addBox(new Vec3(0.5, 0.5, 0.5), stpos, 1, phymtl1);
	let v = 20;
	setTimeout(() => {
		sp.owner.destroy();
	}, 13000);
	sp.setVel(dir.x * v, dir.y * v, dir.z * v);

}

export function Main(sce: Scene3D, mtl: BlinnPhongMaterial, cam: MouseCtrl1) {
	camctr = cam;
	cam.dist = 20;
	sce3d = sce;
	mtl1 = mtl;
	//mtl.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
	initPhy(sce);

	testGround();
	//createJoint();

	Laya.stage.on(Event.MOUSE_DOWN, null, (e: { stageX: number, stageY: number }) => {
		mouseDownEmitObj(e.stageX, e.stageY);
	});

	Laya.stage.on(Event.KEY_DOWN, null, (e: Event) => {
		let key = String.fromCharCode(e.keyCode);
		switch (key) {
			case 'X':
				break;
			case 'Y':
				break;
			case 'Z':
				break;
			default:
				break;
		}
	});

	//testLift();
	//testConveyorbelt();
	loadObj(oo,world.world);
	//b.phyBody.velocity=new Vec3(-1,0,0);
}