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
import { addBox, addSphere, addZupBox, ZupPos2Yup, ZupQuat2Yup } from "./DemoUtils";
import { CannonWorld } from "./layawrap/CannonWorld";
import { MouseCtrl1 } from "./layawrap/ctrls/MouseCtrl1";
import { PhyRender } from "./layawrap/PhyRender";
import { ContactMaterial } from "./material/ContactMaterial";
import { Material } from "./material/Material";
import { Vec3 } from "./math/Vec3";
import { Body } from './objects/Body';
import { Quaternion } from "./math/Quaternion";
import { Mat3 } from "./math/Mat3";
import { PointToPointConstraint } from "./constraints/PointToPointConstraint";

/**
 * TODO  现在的约束导入的不对，位置差不多，但是轴是错的。Hinge都是错的
 */

var oo = [
	{
		"name": "body",
		"dim": {
			"x": 2,
			"y": 2,
			"z": 0.7146314382553101
		},
		"pos": {
			"x": 0,
			"y": 0,
			"z": 0.1639881581068039
		},
		"quat": {
			"x": 0,
			"y": 0,
			"z": 0,
			"w": 1
		},
		"mass": 1
	},
	{
		"name": "upleg1",
		"dim": {
			"x": 0.37193983793258667,
			"y": 2,
			"z": 0.3193705379962921
		},
		"pos": {
			"x": -1.2967536449432373,
			"y": 1.4567104578018188,
			"z": 0.7426637411117554
		},
		"quat": {
			"x": 0.21128535270690918,
			"y": 0.07480047643184662,
			"z": 0.32523849606513977,
			"w": 0.9186856150627136
		},
		"mass": 1
	},
	{
		"name": "leg1",
		"dim": {
			"x": 0.37193983793258667,
			"y": 3.309077024459839,
			"z": 0.3193705081939697
		},
		"pos": {
			"x": -2.2149131298065186,
			"y": 2.6389265060424805,
			"z": -0.24280133843421936
		},
		"quat": {
			"x": -0.4858756959438324,
			"y": -0.1644555628299713,
			"z": 0.2752131223678589,
			"w": 0.8131032586097717
		},
		"mass": 1
	},
	{
		"name": "uplegpiv0",
		"pos": {
			"x": -0.7917226552963257,
			"y": 0.8426451683044434,
			"z": 0.3600959777832031
		},
		"quat": {
			"x": -0.5004355311393738,
			"y": -0.17742197215557098,
			"z": 0.28244081139564514,
			"w": 0.798944890499115
		},
		"type": "CPOINT",
		"A": "body",
		"B": "upleg1"
	},
	{
		"name": "elbow1",
		"pos": {
			"x": -1.7303791046142578,
			"y": 2.037281036376953,
			"z": 1.128298282623291
		},
		"quat": {
			"x": -0.2769056558609009,
			"y": 0.6490680575370789,
			"z": 0.16814890503883362,
			"w": 0.6883021593093872
		},
		"type": "CHINGE",
		"A": "upleg1",
		"B": "leg1"
	},
	{
		"name": "upleg2",
		"dim": {
			"x": 0.37193983793258667,
			"y": 2,
			"z": 0.3193705081939697
		},
		"pos": {
			"x": 1.405050277709961,
			"y": 1.3525564670562744,
			"z": 0.7426637411117554
		},
		"quat": {
			"x": 0.20413632690906525,
			"y": -0.09254719316959381,
			"z": -0.40240252017974854,
			"w": 0.8876010179519653
		},
		"mass": 1
	},
	{
		"name": "leg2",
		"dim": {
			"x": 0.37193983793258667,
			"y": 3.309077024459839,
			"z": 0.3193705081939697
		},
		"pos": {
			"x": 2.5505735874176025,
			"y": 2.316105842590332,
			"z": -0.24280133843421936
		},
		"quat": {
			"x": -0.46419721841812134,
			"y": 0.2182699292898178,
			"z": -0.36527034640312195,
			"w": 0.7768247723579407
		},
		"mass": 1
	},
	{
		"name": "uplegpiv2",
		"pos": {
			"x": 0.8111399412155151,
			"y": 0.8239705562591553,
			"z": 0.3600959777832031
		},
		"quat": {
			"x": -0.48367947340011597,
			"y": 0.21901701390743256,
			"z": -0.3502465486526489,
			"w": 0.7716301083564758
		},
		"type": "CPOINT",
		"A": "body",
		"B": "upleg2"
	},
	{
		"name": "elbow2",
		"pos": {
			"x": 1.968274712562561,
			"y": 1.8084851503372192,
			"z": 1.128298282623291
		},
		"quat": {
			"x": 0.2503434419631958,
			"y": 0.6597684025764465,
			"z": -0.35592737793922424,
			"w": 0.6126577854156494
		},
		"type": "CHINGE",
		"A": "upleg2",
		"B": "leg2"
	},
	{
		"name": "upleg3",
		"dim": {
			"x": 0.3719399869441986,
			"y": 2.0000007152557373,
			"z": 0.3193705379962921
		},
		"pos": {
			"x": 1.47260320186615,
			"y": -1.278676986694336,
			"z": 0.7426637411117554
		},
		"quat": {
			"x": 0.08820129185914993,
			"y": -0.20605134963989258,
			"z": -0.8959276080131531,
			"w": 0.38350626826286316
		},
		"mass": 1
	},
	{
		"name": "leg3",
		"dim": {
			"x": 0.3719399869441986,
			"y": 3.3090782165527344,
			"z": 0.3193705379962921
		},
		"pos": {
			"x": 2.534581184387207,
			"y": -2.3335957527160645,
			"z": -0.24280133843421936
		},
		"quat": {
			"x": -0.19528786838054657,
			"y": 0.47432416677474976,
			"z": -0.7937721014022827,
			"w": 0.32681041955947876
		},
		"mass": 1
	},
	{
		"name": "uplegpiv3",
		"pos": {
			"x": 0.8931016325950623,
			"y": -0.7343330383300781,
			"z": 0.3600959777832031
		},
		"quat": {
			"x": -0.209161639213562,
			"y": 0.48802223801612854,
			"z": -0.7791792154312134,
			"w": 0.3331148326396942
		},
		"type": "CPOINT",
		"A": "body",
		"B": "upleg3"
	},
	{
		"name": "elbow3",
		"pos": {
			"x": 1.9769980907440186,
			"y": -1.7989451885223389,
			"z": 1.128298282623291
		},
		"quat": {
			"x": 0.6299661993980408,
			"y": 0.31797581911087036,
			"z": -0.6760967969894409,
			"w": 0.21196015179157257
		},
		"type": "CHINGE",
		"A": "upleg3",
		"B": "leg3"
	},
	{
		"name": "upleg0",
		"dim": {
			"x": 0.37193983793258667,
			"y": 2,
			"z": 0.3193705379962921
		},
		"pos": {
			"x": -1.425223469734192,
			"y": -1.3312822580337524,
			"z": 0.7426637411117554
		},
		"quat": {
			"x": -0.09407898783683777,
			"y": -0.20343495905399323,
			"z": -0.8845512866973877,
			"w": -0.40906283259391785
		},
		"mass": 1
	},
	{
		"name": "leg0",
		"dim": {
			"x": 0.3719398081302643,
			"y": 3.3090767860412598,
			"z": 0.3193705081939697
		},
		"pos": {
			"x": -2.585102081298828,
			"y": -2.2775027751922607,
			"z": -0.24280133843421936
		},
		"quat": {
			"x": 0.22175291180610657,
			"y": 0.46254342794418335,
			"z": -0.7740572690963745,
			"w": -0.3710990846157074
		},
		"mass": 1
	},
	{
		"name": "uplegpiv1",
		"pos": {
			"x": -0.8234346508979797,
			"y": -0.8116840124130249,
			"z": 0.3600959777832031
		},
		"quat": {
			"x": 0.22264637053012848,
			"y": 0.4820196032524109,
			"z": -0.7689757347106934,
			"w": -0.35603657364845276
		},
		"type": "CPOINT",
		"A": "body",
		"B": "upleg0"
	},
	{
		"name": "elbow0",
		"pos": {
			"x": -1.9952385425567627,
			"y": -1.7786928415298462,
			"z": 1.128298282623291
		},
		"quat": {
			"x": 0.657867968082428,
			"y": -0.2552954852581024,
			"z": -0.6099652647972107,
			"w": -0.3605222702026367
		},
		"type": "CHINGE",
		"A": "upleg0",
		"B": "leg0"
	}
]

var obj1 = {
	name: 'sp1',
	parts: [
		{
			name: 'body',
			type: 'Dynamic',
			mass: 1,
			shape: 'Box',
			shapeparam: { x: 0, y: 0, z: 0 },
			pos: {},
			quat: {}
		},
		{
			name: 'elbow0',
			type: 'c_hingeworld',
			A: '',
			B: '',
			pos: {},
			quat: {}
		}
	]
};

var tmpV1 = new Vec3();
var tmpQ = new Quaternion();
function worldPosToLocal(pos: Vec3, body: Body): Vec3 {
	let ret = new Vec3();
	let rpos = tmpV1;
	pos.vsub(body.position, rpos);
	let invq = tmpQ;
	body.quaternion.conjugate(invq);
	invq.vmult(rpos, ret);
	return ret;
}

function worldQToLocal(q: Quaternion, body: Body): Quaternion {
	let invq = tmpQ;
	body.quaternion.conjugate(invq);
	let ret = new Quaternion();
	invq.mult(q, ret);
	return ret;
}

function getZAxisFromQ(q: Quaternion) {
	let ret = new Vec3();
	let m = new Mat3();
	m.setRotationFromQuaternion(q);
	ret.set(m.ele[6], m.ele[7], m.ele[8])
	return ret;
}

function loadObj(o: Object[]) {
	// 创建body
	var allpart: { [key: string]: Body } = {};
	o.forEach((obj: any) => {
		if (!obj.type || obj.type == "Rigid") {
			let b = addZupBox(obj.dim, obj.mass, obj.pos, obj.quat);
			b.setName(obj.name);
			allpart[obj.name] = b.phyBody;
		}
	});
	// 创建constraint
	o.forEach((c: any) => {
		switch (c.type) {
			case 'CPOINT': {
				let a = allpart[c.A];
				let b = allpart[c.B];
				let cpos = new Vec3(c.pos.x, c.pos.y, c.pos.z);
				let cquat = new Quaternion(c.quat.x, c.quat.y, c.quat.z, c.quat.w);
				//pos和quat转到y向上
				ZupPos2Yup(cpos, cpos);
				ZupQuat2Yup(cquat, cquat);
				let ct = new PointToPointConstraint(a,
					worldPosToLocal(cpos, a),
					b,
					worldPosToLocal(cpos, b));

				let ct1 = new ConeTwistConstraint(a, b, 1e10,
					worldPosToLocal(cpos, a),
					worldPosToLocal(cpos, b),
					getZAxisFromQ(worldQToLocal(cquat, a)),
					getZAxisFromQ(worldQToLocal(cquat, b)),
					deg2r(10), deg2r(10), false);
				ct.collideConnected = false;
				world.world.addConstraint(ct);
			}
				break;
			case 'CHINGE': {
				let a = allpart[c.A];	// a,b这时候的位置已经被修改成y向上了。
				let b = allpart[c.B];
				let cpos = new Vec3(c.pos.x, c.pos.y, c.pos.z);
				let cquat = new Quaternion(c.quat.x, c.quat.y, c.quat.z, c.quat.w);
				//pos和quat转到y向上
				ZupPos2Yup(cpos, cpos);
				ZupQuat2Yup(cquat, cquat);

				let h = new HingeConstraint(a, b, 1e6,
					worldPosToLocal(cpos, a),
					worldPosToLocal(cpos, b),
					getZAxisFromQ(worldQToLocal(cquat, a)),
					getZAxisFromQ(worldQToLocal(cquat, b)));
				h.collideConnected = false;
				world.world.addConstraint(h);
			}
				break;
			case '':
				break;
			default:
				break;
		}
		//if(C.type ==)
	});
}

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
		new Vec3(0.3, 0.2, -0.3), new Vec3(1, 0, 0),	//point,dir。dir可以认为是插槽的方向
		new Vec3(-0.3, 0.2, -0.3), new Vec3(-1, 0, 0),
		new Vec3(0.3, 0.2, 0.3), new Vec3(1, 0, 0),
		new Vec3(-0.3, 0.2, 0.3), new Vec3(-1, 0, 0)
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
	loadObj(oo);

	//b.phyBody.velocity=new Vec3(-1,0,0);
}