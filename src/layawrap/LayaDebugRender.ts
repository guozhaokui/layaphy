import { Scene3D } from "laya/d3/core/scene/Scene3D";
import Shape, { SHAPETYPE } from "../shapes/Shape";
import World, { IPhyRender } from "../world/World";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Color } from "laya/d3/math/Color";

let col1=new Color();
let p1=new Vector3();
let p2= new Vector3();
let p3 = new Vector3();
/**
 * 渲染物理线框
 */
export class PhyRender implements IPhyRender{
    sce: Scene3D;
    phyworld: World;
    drawAllShape = true;
    renders:PixelLineSprite3D[]=[];
    constructor(sce: Scene3D, world: World) {
        this.sce = sce;
        this.phyworld = world;
        world.phyRender=this;
        let r = new PixelLineSprite3D(1024);
        this.renders.push(r);
        sce.addChild(r);
    }

    addSeg(stx: number, sty: number, stz: number, dirx: number, diry: number, dirz: number, color: number): void {
        let r = this.renders[0];
        p1.setValue(stx,sty,stz);
        p2.setValue(dirx,diry,dirz);
        Vector3.add(p1,p2,p3);
        col1.r = ((color>>16)&0xff)/255;
        col1.g = ((color>>8)&0xff)/255;
        col1.b = ((color)&0xff)/255;
        r.addLine(p1,p3,col1, col1);
    }

    addPoint(px: number, py: number, pz: number, color: number): void {
        let axlen=0.4;
        let hAxlen=0.2;
        this.addSeg(px-hAxlen,py,pz,axlen,0,0,color);
        this.addSeg(px,py-hAxlen,pz,0,axlen,0,color);
        this.addSeg(px,py,pz-hAxlen,0,0,axlen,color);
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

        // 所有的body的所有的shape
        // sleep的要偏暗

        // 所有的碰撞点，碰撞法线

        // body的私有信息

    }

    createMesh(shape: Shape) {
        switch (shape.type) {
            case SHAPETYPE.BOX:
                break;
            case SHAPETYPE.SPHERE:
                break;
            case SHAPETYPE.PLANE:
                break;
            case SHAPETYPE.CYLINDER:
                break;
            case SHAPETYPE.CAPSULE:
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
}

