import {Capsule} from "./shapes/Capsule";
import {Vec3} from "./math/Vec3";
import { Quaternion as LayaQuat } from "laya/d3/math/Quaternion";
import {Quaternion} from "./math/Quaternion";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import {Mat3} from "./math/Mat3";
import { GSSolver } from "./solver/GSSolver";
import { ContactEquation } from "./equations/ContactEquation";
import { Body } from "./objects/Body";
import { Sphere } from "./shapes/Sphere";
import { World } from "./world/World";
import { Box } from "./shapes/Box";

function test() {
    debugger;
    const cap = new Capsule(1, 2);
    let q = new Quaternion();
    cap.calcDir(q);
    let hit = new Vec3();
    let capPos = new Vec3();
    let planePos = new Vec3(0, 0, -2);
    let planeNorm = new Vec3(0, 0, 1);
    let deep = cap.hitPlane(capPos, planePos, planeNorm, hit);
    console.log(deep);
}

function testQuat(): void {
    let qlaya = new LayaQuat();
    LayaQuat.createFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 4, qlaya);
    let matLaya = new Matrix4x4();
    Matrix4x4.createFromQuaternion(qlaya, matLaya);
    let qcannon = new Quaternion();
    qcannon.setFromAxisAngle(new Vec3(0, 0, 1), -Math.PI / 4);
    let mcannon = new Mat3();
    mcannon.setRotationFromQuaternion(qcannon);
    //console.log(matLaya, mcannon);

    let v1 = new Vector3(1, 0, 0);
    let v2 = new Vector3(0, 1, 0);
    let v3 = new Vector3();
    Vector3.cross(v1, v2, v3);
    console.log(v3);

    let v4 = new Vec3(1, 0, 0);
    let v5 = new Vec3(0, 1, 0);
    let v6 = new Vec3();
    v4.cross(v5, v6);
    console.log(v6);
}

function testGSSover(){
	let world = new World();
	let solver = new GSSolver();
	let bodySph = new Body(1,new Sphere(1));
	let body1 = new Body(0);
	let box1 = new Box(new Vec3(100,1,100));
	body1.addShape(box1);
	let body2 = new Body(0);
	world.addBody(bodySph);
	world.addBody(body1);
	world.addBody(body2);
	let c1 = new ContactEquation(bodySph, body1);
	let c2 = new ContactEquation(bodySph, body2);
	c1.ri.set(1,0,0);// 球心到碰撞点
	c1.rj.set(-1,0,0);// box中心到碰撞点
	c1.ni.set(1,0,0); //球的法线
	solver.addEquation(c1);

	c1.ri.set(-1,0,0);// 球心到碰撞点
	c1.rj.set(1,0,0);// box中心到碰撞点
	c1.ni.set(-1,0,0); //球的法线
	solver.addEquation(c2);
	solver.solve(1/60,world);
}

function testGSSover1(){
	let world = new World();
	let solver = new GSSolver();
	let bodySph = new Body(1,new Sphere(0.3));
	bodySph.addShape( new Sphere(0.3));
	bodySph.position.set(2.0916726666364083, 2.9696529691107263, -0.8227107766723314);

	let bodyBox = new Body(0);
	bodyBox.addShape(new Box(new Vec3(10,10,10)));
	bodyBox.position.set(0,0,0);

	world.addBody(bodySph);
	world.addBody(bodyBox);

	let c1 = new ContactEquation(bodySph, bodyBox);
	c1.ni.set(0,-1,0);

	c1.ri.set(0, -0.3, 0);// 球心到碰撞点
	c1.rj.set(2.0916726666364083, 5, -0.8227107766723314);// box中心到碰撞点
	solver.addEquation(c1);

	let dt = 1/60;
	solver.solve(dt,world);

	bodySph.integrate(dt,true,false);

}
//testQuat();
//test();
//TEST

export function Main(){
	testGSSover1();
}