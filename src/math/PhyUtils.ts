import { BoundBox } from "../../laya/laya/d3/math/BoundBox";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";
import { Matrix3x3 } from "../../laya/laya/d3/math/Matrix3x3";
import { Quaternion } from "../../laya/laya/d3/math/Quaternion";

export function AABBOverlaps(A:BoundBox, B:BoundBox){
    if( A.min.x>B.max.x || A.max.x<B.min.x || 
        A.min.y>B.max.y || A.max.y<B.min.y ||
        A.min.z>B.max.z || A.max.z<B.min.z)
    return false;
    return true;
}

export function Vec3Trans(a:Vector3, mat:Matrix3x3, o:Vector3){
    var e = mat.elements;
    let x=a.x,y=a.y,z=a.z;
    o.x=x*e[0]+y*e[3]+z*e[6];
    o.y=x*e[1]+y*e[4]+z*e[7];
    o.z=x*e[2]+y*e[5]+z*e[8];
    return o;
}

/**
 * 假设v是一个缩放对角阵
 * @param m 
 * @param v 
 * @param outm 
 */
export function mat3Scale(m:Matrix3x3, v:Vector3, outm:Matrix3x3){
    let e = m.elements;
    let m0=e[0],m1=e[1],m2=e[2],m3=e[3],m4=e[4],m5=e[5],m6=e[6],m7=e[7],m8=e[8];
    let oe = outm.elements;
    oe[0]=e[0]*v.x; oe[1]=e[1]*v.y; oe[2]=e[2]*v.z;
    oe[3]=e[3]*v.x; oe[4]=e[4]*v.y; oe[5]=e[5]*v.z;
    oe[6]=e[6]*v.x; oe[7]=e[7]*v.y; oe[8]=e[8]*v.z;
    return outm;
}

/**
 * 把一个四元数根据当前的角速度和时间进行积分
 * @param q 
 * @param angVel 
 * @param dt 
 * @param qout 可以与q是同一个
 */
export function QuatIntegrate(q:Quaternion, angVel:Vector3, dt:number, qout:Quaternion){
    qout = qout || new Quaternion();

    var ax = angVel.x,
        ay = angVel.y,
        az = angVel.z,
        bx = q.x,
        by = q.y,
        bz = q.z,
        bw = q.w;

    var half_dt = dt * 0.5;
    // 世界坐标系下的角速度和和四元数微分的关系
    // https://www.cnblogs.com/21207-iHome/p/9142208.html
    // q'(t) = 0.5 W(t)*q(t)
    // W(t) = angVxI, angVyJ, angVzK,0
    // out += 0.5*(qAngVel*q)
    // 不知道为什么可以把角速度直接当做四元数
    qout.x += half_dt * (ax * bw + ay * bz - az * by);
    qout.y += half_dt * (ay * bw + az * bx - ax * bz);
    qout.z += half_dt * (az * bw + ax * by - ay * bx);
    qout.w += half_dt * (- ax * bx - ay * by - az * bz);

    return qout;
}

