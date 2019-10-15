import {Capsule} from "./shapes/Capsule";
import {Vec3} from "./math/Vec3";
import { Quaternion as LayaQuat } from "laya/d3/math/Quaternion";
import {Quaternion} from "./math/Quaternion";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import {Mat3} from "./math/Mat3";

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
//testQuat();
//test();

//TEST