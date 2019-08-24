import Shape, { SHAPETYPE } from "./Shape";
import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
//import { quat_AABBExt_mult } from "./Box";

//let aabbExt = new Vec3();
/**
 * 缺省主轴是z轴
 * 测试的时候可以通过组合shape来模拟胶囊
 */
export default class Capsule extends Shape{
    radius:f32;
    height:f32;
    noTrans=false;    // 站立的胶囊，可以简单处理
    axis:Vec3 = new Vec3();          // 主轴。是一半
    constructor(r:f32=1, h:f32=1){
        super();
        this.type=SHAPETYPE.CAPSULE;
        this.radius=r;
        this.height=h;
    }

    /**
     * 计算halfh向量变换后的值
     * @param q 
     */
    calcDir(q:Quaternion):Vec3{
        //0,0,1 被旋转以后
        let qx = q.x, qy=q.y, qz=q.z, qw=q.w;
        let axis = this.axis;
        let h = this.height;
        let halfh:f32 = h/2;
        //rx=(qw*qw + qx*qx - qz*qz -qy*qy)*x +( 2*qx*qy -2*qz*qw)*y + (2*qy*qw + 2*qx*qz )*z;
        axis.x = (qy*qw + qx*qz )*h;
        //ry=(2*qz*qw +2*qx*qy)*x + (qw*qw +qy*qy -qx*qx -qz*qz)*y + (-2*qx*qw +2*qy*qz)*z;
        axis.y = (-qx*qw +qy*qz)*h;
        //rz=(-2*qy*qw   +2*qx*qz)*x + (2*qx*qw  +2*qy*qz ) *y +  (qw2 +qz2 -qy2 -qx2)*z;
        axis.z = (qw*qw+qz*qz-qy*qy-qx*qx)*halfh;
        return axis;
    }

    pointDistance(pos: Vec3, quat: Quaternion, p:Vec3):f32{
        let halfh=this.height/2;
        let dx = p.x - pos.x;
        let dy = p.y - pos.y;
        //let dz = p.z - pos.z;
        //let dist:f32=-1;
        if(this.noTrans){
            // 如果是直立的，最简单。 需要注意坐标系，这里假设z向上
            let dz = p.z-pos.z;
            if(dz>halfh){
                // 超过上面的点
                dz -= halfh;
                return Math.sqrt(dx*dx+dy*dy+dz*dz);
            }else if(dz>-halfh){
                // 超过下面的点
                return Math.sqrt(dx*dx+dy*dy);
            }else{
                // 低于下面的点
                dz += halfh;
                return Math.sqrt(dx*dx+dy*dy+dz*dz);
            }
        }else{

        }
        return 0;
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
        /*
        let h =this.height;
        aabbExt.set(r,r,h/2+r);
        quat_AABBExt_mult(quat,aabbExt,min);//暂存到min中
        pos.vadd(min,max);
        pos.vsub(min,min);
        */
       let ext = this.calcDir(quat);
       let mx = Math.abs(ext.x)+r;
       let my = Math.abs(ext.y)+r;
       let mz = Math.abs(ext.z)+r;
       min.x = pos.x-mx; min.y=pos.y-my; min.z=pos.z-mz;
       max.x = pos.x+mx; max.y=pos.y+my; max.z=pos.z+mz;
    }

    volume(): f32 {
        let r = this.radius;
        let h = this.height;
        let p = Math.PI;
        return h*p*r*r+3/4*p*r*r*r;
    }    
}