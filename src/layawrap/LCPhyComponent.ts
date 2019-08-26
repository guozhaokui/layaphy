import { Component } from "laya/components/Component";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import phyQuat from "../math/Quaternion";
import Vec3 from "../math/Vec3";
import Body from "../objects/Body";
import Shape from "../shapes/Shape";
import { LCPhyWorld } from "./LCPhyWorld";
import Material from "../material/Material";

export default class LCPhyComponent extends Component{
    phyBody:Body;
    constructor(){
        super();
    }
    _onEnable(){
        //let sce = this.owner.scene as Scene3D;
    }
    _onDisable(){

    }

    // 添加到对象上的时候，自动创建物理对象 Body, 并添加到物理世界中
    _onAdded(){
        let body = this.phyBody;
        if(!body){
            this.phyBody = body = new Body(1);
        }

        LCPhyWorld.inst.bodies.push(this);//TODO 会多次添加么

        let world = LCPhyWorld.inst.world
        world.addBody(body);
        //let sce = this.owner.scene as Scene3D;
        let sp = this.owner as Sprite3D;
        let trans = sp.transform;
        let pos = trans.localPosition;
        body.position.set(pos.x,pos.y,pos.z);
        let q = trans.localRotation;
        //问题 laya的四元数与这里是不是不兼容
        body.quaternion.set(q.x,q.y,q.z,q.w);
    }

    setName(n:string):void{
        this.phyBody.name=n;
    }

    setMass(m:f32){
        this.phyBody.mass=m;
    }
    addShape(s:Shape,off?:Vector3,offq?:Quaternion|phyQuat){
        let body = this.phyBody;
        if(off){
            tempVec3.set(off.x,off.y,off.z);
        }
        body.addShape(s,tempVec3, offq as phyQuat);
    }
    setG(g:f32){

    }

    setVel(vx:f32, vy:f32, vz:f32):void{
        this.phyBody.velocity.set(vx,vy,vz);
    }

    getVel(v:Vec3):Vec3{
        v.copy(this.phyBody.velocity);
        return v;
    }

    setMaterial( mtl:Material){
        this.phyBody.material=mtl;
    }

    _onDestroy(){

    }
    _onAwake(){

    }

    applyPose(){
        let body = this.phyBody;
        if(body.isSleep())
            return;
        let sp = this.owner as Sprite3D;
        let trans = sp.transform;
        let phypos = body.position;
        let phyrot = body.quaternion;
        trans.localPosition.setValue(phypos.x, phypos.y, phypos.z);
        let q = trans.localRotation;
        q.x=phyrot.x, q.y=phyrot.y; q.z=phyrot.z; q.w=phyrot.w;
        trans.localRotation = q;
    }
}

var tempVec3=new Vec3();
var tempQuat=new phyQuat();