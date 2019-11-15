import { Component } from "laya/components/Component";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Material } from "../material/Material";
import { Quaternion as phyQuat } from "../math/Quaternion";
import { Vec3 } from "../math/Vec3";
import { Body } from "../objects/Body";
import { Shape } from "../shapes/Shape";
import { CannonWorld } from "./CannonWorld";
import { IPhyBody } from "./PhyInterface";

export class CannonBody extends Component implements IPhyBody{
	mass: number;
	lineVel: Vector3;
	angVel: Vector3;
	gravity: Vector3 | null;
	noRotate: boolean;
	collisionGroup: number;
	canCollideWith: number;
	_enablePhy=false;
	phyBody:Body;
	private _ROOff:Vector3|null;	// 渲染原点的位置。相对于物理原点

    constructor(){
		super();
	}
	
	set fixedRotation(v: boolean){
		let b = this.phyBody;
		if(b.fixedRotation!=v){
			b.fixedRotation=v;
			b.updateMassProperties();
		}
	}

	get fixedRotation():boolean{
		return this.phyBody.fixedRotation;
	}

	addCenterForce(f: Vector3): void {
		let b = this.phyBody;
		b.force.x+=f.x;
		b.force.y+=f.y;
		b.force.z+=f.z;
	}

	addForce(f: Vector3, pos: Vector3): void {
		throw new Error("Method not implemented.");
	}

    _onEnable(){
		let owner = this.owner;

        //let sce = this.owner.scene as Scene3D;
		this.phyBody.enable=true;
		
    }
    _onDisable(){
        this.phyBody.enable=false;
    }

    // 添加到对象上的时候，自动创建物理对象 Body, 并添加到物理世界中
    _onAdded(){
        let body = this.phyBody;
        if(!body){
            this.phyBody = body = new Body(1);
			body.userData = this;
        }

        //CannonWorld.inst.bodies.push(this);//TODO 会多次添加么

        let world = CannonWorld.inst.world
		world.addBody(body);
		this.phyUseRenderPose();
        //let sce = this.owner.scene as Scene3D;
    }

	enablePhy(b: boolean): void {
		if(!this._enablePhy&&b){
			//每次启用都要同步渲染位置
			this.phyUseRenderPose();
		}
		this._enablePhy=b;
		this.phyBody.enable=b;
	}

    setName(n:string):void{
        this.phyBody.name=n;
    }

    setMass(m:f32){
		this.phyBody.mass=m;
		this.phyBody.updateMassProperties();
	}

	setPos(x:number,y:number,z:number):void{
		this.phyBody.setPos(x,y,z);
	}

	/** 位置是基于渲染模型的 */
	setRPos(x:number,y:number,z:number):void{
		let body = this.phyBody;
        let sp = this.owner as Sprite3D;
        let trans = sp.transform;
        //let pos = trans.localPosition;
		let q = trans.localRotation;
		
		let off = this._ROOff;
		if(off){
			Vector3.transformQuat(off,q,tmpV1);
			body.position.set(x-tmpV1.x, y-tmpV1.y, z-tmpV1.z);
		}else{
			body.position.set(x,y,z);
		}
		body.angularVelocity.set(0,0,0);
		body.velocity.set(0,0,0);
	}

    addShape(s:Shape,off?:Vector3,offq?:Quaternion|phyQuat){
		let body = this.phyBody;
		let voff:Vec3|undefined =undefined;
		if(off){
			voff = new Vec3(off.x,off.y,off.z);
		}
		let vq:phyQuat|undefined=undefined;
		if(offq){
			vq = new phyQuat(offq.x,offq.y,offq.z,offq.w);
		}
        body.addShape(s,voff,vq);
	}
	
	setROff(x:number,y:number,z:number){
		if(!this._ROOff){
			this._ROOff=new Vector3(x,y,z);
		}else{
			this._ROOff.setValue(x,y,z);
		}
	}

    setShape(){
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
        let w = this.phyBody.world;
        if(w){
            w.remove(this.phyBody);
        }
    }
    _onAwake(){

	}
	
	phyUseRenderPose(){
		let body = this.phyBody;
        let sp = this.owner as Sprite3D;
        let trans = sp.transform;
        let pos = trans.localPosition;
        body.position.set(pos.x,pos.y,pos.z);
        let q = trans.localRotation;
        //问题 laya的四元数与这里是不是不兼容
		body.quaternion.set(q.x,q.y,q.z,q.w);
		body.angularVelocity.set(0,0,0);
		body.velocity.set(0,0,0);
	}

    applyPose(){
        let body = this.phyBody;
        if(this.destroyed)
            return;
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
var tmpV1 = new Vector3();
//var tempQuat=new phyQuat();

