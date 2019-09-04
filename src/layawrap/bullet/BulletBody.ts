import { getBullet } from "./bulletLoader";
import { Component } from "laya/components/Component";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { BtWorld } from "./BulletWorld";
import Material from "../../material/Material";

export class BtBody extends Component{
    cptr:int;
    bullet:BulletExport|null;
    mat:Matrix4x4 = new Matrix4x4();
    constructor(){
        super();
        this.bullet = getBullet();
    }

    destroy(){
        let world = BtWorld.inst;
        if(world){
            world.removeBody(this);
        }
        if(this.bullet){
            this.bullet.deleteRigidBody(this.cptr);
        }
    }

    _onAdded(){
        let world = BtWorld.inst;
        if(world){
            world.addBody(this);
        }
        let bullet = this.bullet;
        if(bullet){
            let sp = this.owner as Sprite3D;
            let trans = sp.transform.worldMatrix.elements;
            // 把自己的姿态同步给物理
            let transptr = bullet.getATmpTransorm()>>3; //float64 
            let btfloatbuf = bullet.f64buffer;
            btfloatbuf[transptr++]=trans[0];btfloatbuf[transptr++]=trans[1];btfloatbuf[transptr++]=trans[2];
            btfloatbuf[transptr++]=trans[4];btfloatbuf[transptr++]=trans[5];btfloatbuf[transptr++]=trans[6];
            btfloatbuf[transptr++]=trans[8];btfloatbuf[transptr++]=trans[9];btfloatbuf[transptr++]=trans[10];
            btfloatbuf[transptr++]=trans[12];btfloatbuf[transptr++]=trans[13];btfloatbuf[transptr++]=trans[14];
            
            bullet.bodySetTransform(transptr);
        }
    }

    getPhyTransform(){
        if(!this.bullet){

        }else{
            let btfloatbuf = this.bullet.f64buffer;
            let poseptr:int = this.bullet.bodyGetPose(this.cptr)>>3;//float64
            let mate = this.mat.elements;
            mate[0]=btfloatbuf[poseptr++];
            // TODO 
        }
    }

    // 同步物理姿态
    applyPose(){
        let sp = this.owner as Sprite3D;
        let trans = sp.transform;
        trans.localMatrix = this.mat;
    }

    setTransform(x:f32,y:f32,z:f32, rx:f32,ry:f32,rz:f32,rw:f32):void{
    }

    onCllision(){
        //TODO 
    }

    setMaterial( mtl:Material){
    }
    setName(name:string){

    }

    setShape(shape:i32){
        let bullet = this.bullet;
        if(bullet){
            bullet.RBInfoSetShape(shape);
            this.cptr = bullet.createRigidBodyByRBInfo();
        }
    }
}