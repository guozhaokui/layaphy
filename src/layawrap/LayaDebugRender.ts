import { Scene3D } from "laya/d3/core/scene/Scene3D";
import Shape, { SHAPETYPE } from "../shapes/Shape";
import World, { IPhyRender } from "../world/World";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Color } from "laya/d3/math/Color";
import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";
import { BODYTYPE } from "../objects/Body";
import Capsule from "../shapes/Capsule";
import Plane from "../shapes/Plane";

let col1=new Color();
let p1=new Vector3();
let p2= new Vector3();
let p3 = new Vector3();
/**
 * 渲染物理线框
 */
export class PhyRender extends IPhyRender{
    sce: Scene3D;
    phyworld: World;
    drawAllShape = true;
    renders:PixelLineSprite3D[]=[];
    constructor(sce: Scene3D, world: World) {
        super();
        this.sce = sce;
        this.phyworld = world;
        world.phyRender=this;
        let r = new PixelLineSprite3D(1024);
        this.renders.push(r);
        sce.addChild(r);
    }

    addRay(stx: number, sty: number, stz: number, dirx: number, diry: number, dirz: number, color: number): void {
        let r = this.renders[0];
        p1.setValue(stx,sty,stz);
        p2.setValue(dirx,diry,dirz);
        Vector3.add(p1,p2,p3);
        col1.r = ((color>>16)&0xff)/255;
        col1.g = ((color>>8)&0xff)/255;
        col1.b = ((color)&0xff)/255;
        r.addLine(p1,p3,col1, col1);
    }

    addSeg(stx: number, sty: number, stz: number, edx: number, edy: number, edz: number, color: number): void {
        let r = this.renders[0];
        p1.setValue(stx,sty,stz);
        p2.setValue(edx,edy,edz);
        col1.r = ((color>>16)&0xff)/255;
        col1.g = ((color>>8)&0xff)/255;
        col1.b = ((color)&0xff)/255;
        r.addLine(p1,p2,col1, col1);
    }    

    addPoint(px: number, py: number, pz: number, color: number): void {
        let axlen=0.4;
        let hAxlen=0.2;
        this.addRay(px-hAxlen,py,pz,axlen,0,0,color);
        this.addRay(px,py-hAxlen,pz,0,axlen,0,color);
        this.addRay(px,py,pz-hAxlen,0,0,axlen,color);
    }

    drawLine(pts:Vec3[],color:number):void{
        for(let i=0; i<pts.length-1; i++){
            let p1 = pts[i];
            let p2 = pts[i+1];
            this.addSeg(p1.x,p1.y,p1.z,p2.x,p2.y,p2.z,color);
        }
    }

    // 画笼子的竖线
    drawLine1(pts:Vec3[],h:Vec3,color:number):void{
        for(let i=0; i<pts.length-1; i++){
            let p1 = pts[i];
            this.addSeg(p1.x,p1.y,p1.z,p1.x+h.x,p1.y+h.y,p1.z+h.z,color);
        }
    }

    stepStart():void{
        this.renders.forEach(r=>{
            r.clear();
        })

        // 坐标轴
        let r = this.renders[0];
        let origin = new Vector3();
        r.addLine(origin, new Vector3(10,0,0), Color.RED,Color.RED);
        r.addLine(origin, new Vector3(0,10,0), Color.GREEN, Color.GREEN);
        r.addLine(origin, new Vector3(0,0,10), Color.BLUE, Color.BLUE);
    }

    stepEnd():void{

    }

    internalStep() {
        let world = this.phyworld;
        let bodies = world.bodies;
        let wq = new Quaternion();
        let wpos = new Vec3();
        bodies.forEach((b,i)=>{
            let shapes = b.shapes;
            b.type & BODYTYPE.KINEMATIC;
            b.sleepState;
            shapes.forEach( (s,si)=>{
                b.quaternion.mult(b.shapeOrientations[si], wq); // 计算世界坐标系的朝向
                b.quaternion.vmult(b.shapeOffsets[si], wpos);    // 把shape的偏移用四元数变换一下
                wpos.vadd(b.position, wpos);    // 世界空间的位置
                this.showShape(s,wpos,wq);
            });
            
        });
        // 所有的body的所有的shape
        // sleep的要偏暗

        // 所有的碰撞点，碰撞法线

        // body的私有信息

    }

    showShape(shape: Shape, pos:Vec3, quat:Quaternion):void {
        switch (shape.type) {
            case SHAPETYPE.BOX:
                break;
            case SHAPETYPE.SPHERE:
                break;
            case SHAPETYPE.PLANE:
                this.createPlaneLine(shape as Plane, pos, quat);
                break;
            case SHAPETYPE.CYLINDER:
                break;
            case SHAPETYPE.CAPSULE:
                this.createCapsuleLine(shape as Capsule, pos, quat);
                break;
            case SHAPETYPE.CONVEXPOLYHEDRON:
                break;
            case SHAPETYPE.COMPOUND:
                break;
            case SHAPETYPE.HEIGHTFIELD:
                break;
            case SHAPETYPE.TRIMESH:
                break;
        }
    }

    /**
     * 
     * @param vin 局部坐标位置
     * @param pos 对象在世界空间的坐标
     * @param q    对象在世界空间的朝向
     * @param vout 转换成世界空间的点
     */
    transVec3(vin:Vec3, pos:Vec3, q:Quaternion, vout:Vec3):Vec3{
        q.vmult(vin,vout);
        vout.vadd(pos,vout);
        return vout;
    }

    createCapsuleLine(cap:Capsule, pos:Vec3, q:Quaternion):void{
        let seg1:i32=16;
        let h = cap.height;
        let r = cap.radius*1.2;
        let i:i32=0;
        let pts:Vec3[]=[];
        pts.length=seg1+1;
        for(i=0;i<pts.length;i++){
            pts[i]=new Vec3();
        }
        for( i=0;i<=seg1; i++){
            let ang = Math.PI*2*i/seg1;
            let pt = new Vec3(r*Math.cos(ang),r*Math.sin(ang),h/2);
            this.transVec3(pt,pos,q,pt);
            pts[i].copy(pt);
        }
        this.drawLine(pts,0xffff0000);
        let hdir = new Vec3(0,0,-h);
        q.vmult(hdir,hdir);
        this.drawLine1(pts,hdir,0xffff0000);
        
        for( i=0;i<=seg1; i++){
            let ang = Math.PI*2*i/seg1;
            let pt = new Vec3(r*Math.cos(ang),r*Math.sin(ang),-h/2);
            this.transVec3(pt,pos,q,pt);
            pts[i].copy(pt);
        }
        this.drawLine(pts,0xffff0000);
    }

    createPlaneLine(plane:Plane, pos:Vec3, q:Quaternion):void{
        let norm = new Vec3(0,0,1);
        let wnorm = q.vmult(norm,norm);
        
    }
}

