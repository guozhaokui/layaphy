import Shape, { SHAPETYPE } from "./Shape";
import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
//import { quat_AABBExt_mult } from "./Box";


//let aabbExt = new Vec3();
let tmpVec1=new Vec3();
let tmpVec2 = new Vec3();
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
        this.axis.set(0,0,h/2);
        this.hasPreNarrowPhase=true;
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

    /**
     * 某个方向上最远距离，相对于自己的原点。前提是已经计算了轴向了。类似于包围盒， dir*maxD 不一定在胶囊上，只有平行和垂直的时候才在表面上
     * @param pos 胶囊所在世界空间的位置
     * @param dir 世界空间的朝向
     * @param outPos 最远的地方的点。 法线就是方向
     */
    supportFunction(myPos:Vec3, dir:Vec3, outPos:Vec3):f32{
        dir.normalize();
        return this.supportFuncion_norm(myPos, dir, outPos);
    }

    supportFuncion_norm(myPos:Vec3, normDir:Vec3, outPos?:Vec3):f32{
        let axis = this.axis;
        let d = axis.dot(normDir);
        let nextend=false;
        if(d<0){
            d=-d;
            nextend=true;   //取另一头
        }
        let l = d+this.radius;   //自身原点到这个点的距离
        if(outPos){
            // 需要计算最远的点在哪
            if(d<1e-6){//只有垂直的时候，在圆柱上，稍微一动，就转到球上了
                myPos.addScaledVector(this.radius, normDir, outPos);
            }else{
                if(nextend){
                    myPos.vsub(axis,outPos);
                    outPos.addScaledVector(this.radius,normDir,outPos);
                }else{
                    myPos.vadd(axis,outPos);
                    outPos.addScaledVector(this.radius,normDir,outPos);
                }
            }
        }
        return l;
    }

    // 要求已经计算axis了    
    pointDistance(pos: Vec3, p:Vec3):f32{
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
     * 到一个平面的距离，如果碰撞了，取碰撞点。
     * 碰撞法线一定是平面法线
     * @param hitPos   世界坐标的碰撞位置
     * @return 进入深度， <0表示没有碰撞
     */
    hitPlane(myPos:Vec3, planePos:Vec3, planeNorm:Vec3,hitPos:Vec3):f32{
        // 反向最远的点就是距离平面最近的点
        tmpVec1.set(-planeNorm.x,-planeNorm.y,-planeNorm.z);
        this.supportFuncion_norm(myPos, tmpVec1,hitPos);
        //下面判断hitPos是否在平面下面
        let planeToHit = tmpVec2;
        hitPos.vsub(planePos,planeToHit);
        let d = planeToHit.dot(planeNorm);        
        if( d>0)    // 没有碰撞
            return -1;
        return -d;
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
        let h = this.height;
        let r = this.radius;
        let r2=r*r;
        let h2=h*h;
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
       // calcDir后会一直重用
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

    onPreNarrowpase(stepId: number,pos:Vec3,quat:Quaternion): void {
        this.calcDir(quat);
    }

}