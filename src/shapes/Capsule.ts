import Shape, { SHAPETYPE } from "./Shape";
import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import { quat_AABBExt_mult } from "./Box";

let aabbExt = new Vec3();
/**
 * 缺省主轴是z轴
 * 测试的时候可以通过组合shape来模拟胶囊
 */
export default class Capsule extends Shape{
    radius:f32;
    height:f32;
    noTrans=false;    // 站立的胶囊，可以简单处理
    //axis:Vec3;          // 主轴
    constructor(r:f32=1, h:f32=1){
        super();
        this.type=SHAPETYPE.CAPSULE;
        this.radius=r;
        this.height=h;
    }

    /**
     * 计算胶囊的转动惯量
     * 用圆柱和半球的转动惯量，结合平移轴原理组合出来
     * @param mass 
     * @param target 
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     * @see https://zh.wikipedia.org/wiki/%E8%BD%89%E5%8B%95%E6%85%A3%E9%87%8F%E5%88%97%E8%A1%A8
     */
    calculateLocalInertia(mass: f32, target: Vec3) {
        let r2=this.radius*this.radius;
        let h2=this.height*this.height;
        target.x=target.y=mass/60*(39*r2+35*h2);
        target.z =9/10*mass*r2;
    }

    updateBoundingSphereRadius(): void {
        this.boundingSphereRadius = this.radius+this.height/2;
    }

    calculateWorldAABB(pos: Vec3, quat:Quaternion, min: Vec3, max: Vec3): void {
        let r=this.radius;
        let h =this.height;
        aabbExt.set(r,r,h/2+r);
        quat_AABBExt_mult(quat,aabbExt,min);//暂存到min中
        pos.vadd(min,max);
        pos.vsub(min,min);
    }

    volume(): f32 {
        let r = this.radius;
        let h = this.height;
        let p = Math.PI;
        return h*p*r*r+3/4*p*r*r*r;
    }    
}