import { Laya } from "Laya";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from 'laya/d3/math/Ray';
import { Vector2 } from 'laya/d3/math/Vector2';
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { ConeTwistConstraint } from "./constraints/ConeTwistConstraint";
import { DistanceConstraint } from './constraints/DistanceConstraint';
import { HingeConstraint } from "./constraints/HingeConstraint";
import { addBox, addSphere } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { Body } from './objects/Body';

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
	//plane
	let p = addBox(new Vec3(100, 100, 100), new Vec3(0, -50, 0), 0, phymtl1);
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


	//let ch1 = addBox(new Vec3(1, 2, 1), new Vec3(0, 1, 0), 1, phymtl1);
	for (let i = 0; i < 0; i++) {
		let b = addBox(new Vec3(1, 1, 1), new Vec3(rand(-10, 10), rand(5, 10), rand(-10, 10)), 1, phymtl2, true);
		b.phyBody.allowSleep = false;
	}
	//ch1.fixedRotation = true;
	//ch1.phyBody._name = 'zhu'

	/*
	let push = addBox( new Vec3(1,1,1), new Vec3(2,1,0), 0);
	push.phyBody.type=BODYTYPE.KINEMATIC;
	*/

	/*
	let b = addBox(new Vec3(1, 0.1, 1), new Vec3(3, 0, 0), 0, phymtl2);
	b.phyBody.type = BODYTYPE.KINEMATIC;
	b.phyBody.allowSleep = false;
	b.phyBody._name = 'ban';
	let tm = 0;
	b.phyBody.onStep = () => {
		let b1 = b.phyBody;
		b1.position.x = 2 + 10 * Math.sin(tm++ / 100);

	}

	let b2 = addBox(new Vec3(1, 0.1, 1), new Vec3(-3, 0, 0), 0, phymtl3);
	b2.phyBody.type = BODYTYPE.KINEMATIC;
	b2.phyBody.allowSleep = false;
	b2.phyBody._name = 'ban';
	b2.phyBody.onStep = () => {
		let b1 = b2.phyBody;
		b1.position.x = 2 + 10 * Math.sin(tm / 100) - 6;
	}
	*/
}

function deg2r(deg: number) {
	return deg * Math.PI / 180;
}

class Leg {
	upper: Body;
	attachPoint = new Vec3(0.1, 0.5, 0.1);//相对upper的点
	attachDir = new Vec3(0, -1, 0);//upper身上的细棍方向，插到body的槽上
	constructor() {
		let upperArm = addBox(new Vec3(0.2, 1, 0.2), new Vec3(0, 2, 0), 1, phymtl1);
		let lowerArm = addBox(new Vec3(0.2, 1, 0.2), new Vec3(0, 1, 0), 1, phymtl1);
		let pivotA = new Vec3(0, -0.5, 0);
		let pivotB = new Vec3(0, 0.5, 0);
		let AxisA = new Vec3(0, 0, 1);
		let AxisB = new Vec3(0, 0, 1);
		this.upper = upperArm.phyBody;
		let c1 = new HingeConstraint(this.upper, lowerArm.phyBody, 1e6, pivotA, pivotB, AxisA, AxisB);
		c1.collideConnected = false;
		world.world.addConstraint(c1);
		let muscle = new DistanceConstraint(upperArm.phyBody, lowerArm.phyBody, 0.9);
		world.world.addConstraint(muscle);

		setInterval(() => {
			muscle.distance = 0.7 + 0.3 * Math.cos(Date.now() / 100);
		}, 20);

	}
}

class mainbody {
	phybody: Body
	legpoint: Vec3[] = [
		new Vec3(0.3, 0.2, -0.3), new Vec3(1,0,0),	//point,dir。dir可以认为是插槽的方向
		new Vec3(-0.3, 0.2, -0.3), new Vec3(-1,0,0),
		new Vec3(0.3, 0.2, 0.3), new Vec3(1,0,0),
		new Vec3(-0.3, 0.2, 0.3), new Vec3(-1,0,0)
	];
	constructor() {
		let body = addBox(new Vec3(1, 0.4, 1), new Vec3(0, 3, 0), 2, phymtl1);
		body.setMass(10);
		this.phybody = body.phyBody;
	}

	addleg(id: int) {
		let pt = this.legpoint[id * 2];
		let dir = this.legpoint[id * 2 + 1];
		dir.normalize();
		let l = new Leg();
		let leg1pt = new ConeTwistConstraint(this.phybody, l.upper, 1e10,
			pt, l.attachPoint,
			dir, l.attachDir,
			deg2r(10), deg2r(10), false);
		leg1pt.collideConnected = false;
		world.world.addConstraint(leg1pt);

	}

}

function createJoint() {
	let b = new mainbody();
	b.addleg(0);
	b.addleg(1);
	b.addleg(2);
	b.addleg(3);
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
	createJoint();

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

	//b.phyBody.velocity=new Vec3(-1,0,0);
}