import Shape, { SHAPETYPE } from "./Shape";
import Vec3 from "../math/Vec3";

/**
 * 缺省主轴是z轴
 * 测试的时候可以通过组合shape来模拟胶囊
 */
export default class Capsule extends Shape{
    radius:f32=1;
    height:f32=1;
    noTrans=false;    // 站立的胶囊，可以简单处理
    //axis:Vec3;          // 主轴
    constructor(){
        super();
        this.type=SHAPETYPE.CAPSULE;
        
    }

    /**
     * 计算胶囊的转动惯量
     * 用圆柱和半球的转动惯量，结合平移轴原理组合出来
     * @param mass 
     * @param target 
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     * @see https://zh.wikipedia.org/wiki/%E8%BD%89%E5%8B%95%E6%85%A3%E9%87%8F%E5%88%97%E8%A1%A8
     */
    calculateLocalInertia(mass: number, target: Vec3) {
        let r2=this.radius*this.radius;
        let h2=this.height*this.height;
        target.x=target.y=mass/60*(39*r2+35*h2);
        target.z =9/10*mass*r2;
    }
    updateBoundingSphereRadius(): void {
        throw new Error("Method not implemented.");
    }
    calculateWorldAABB(pos: Vec3, quat: import("../math/Quaternion").default, min: Vec3, max: Vec3): void {
        throw new Error("Method not implemented.");
    }
    volume(): number {
        throw new Error("Method not implemented.");
    }    
}