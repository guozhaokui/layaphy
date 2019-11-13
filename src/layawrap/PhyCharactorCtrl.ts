import { Component } from "laya/components/Component";
import { Vector3 } from "laya/d3/math/Vector3";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";
import { Material } from "../material/Material";
import { Vec3 } from "../math/Vec3";
import { Body } from "../objects/Body";
import { Sphere } from "../shapes/Sphere";
import { PhyCollideEvent, World } from "../world/World";
import { CannonWorld } from "./CannonWorld";
import { ICharactorCtrl } from "./PhyInterface";

export class PhyCharactorCtrl extends Component implements ICharactorCtrl{
	private _mass: number;
	private _friction=0;
	get mass(){
		return this._mass;
	}
	set mass(m:number){
		//TODO
	}
	//private _mtl =new Material('ctrl',1,0);
	_mtl =new Material('ctrl',1,0);

	/** 当前朝向， +z为0 */
	_curDir:number=0;	
	/** 当前速度的值 */
	curVel:number=10;

	_lineVel =new Vec3();// 只有get，没有set

	angVel: Vector3;
	noRotate: boolean;
	collisionGroup: number;
	canCollideWith: number;
	phyForTrigger:Body|null=null;
	/** 物理实体，有很大摩擦力，所以可以被传送带带走，可以被推走，可以下落 */
	phyBody:Body = new Body(1);
	//phyBody1:Body = new Body(4);
	//spring = new Spring(this.phyBody,this.phyBody1,{
	//		localAnchorA: new Vec3(),
    //        localAnchorB: new Vec3(),
    //        restLength : 2,
    //        stiffness : 150,
    //        damping : 1
	//});
	fixedRotation: boolean;
	canJump: boolean;	gravity: Vector3;
	enableGravity: boolean;
	shape: ColliderShape;
	turnAngle: number;
	linearDamping: number;
	angularDamping: number;
	stepAlignGround: boolean;
	maxSlope: number;
	stepHeight: number;
	state = 0;				//0 正常 1 空中
	pos = new Vec3();
	targetPos = new Vec3();
	onCollisionEnter: (other: ColliderShape, pos: Vector3, normal: Vector3) => void;
	onCollisionExit: (other: ColliderShape) => void;
	onGround: () => void;
	onFall: () => void;
	onBePushed: () => void;
	onSlidingDown: () => void;
	//lastVel = new Vec3();
	constructor(){
		super();
		this._initPhyBody();
		this.curDir=0;
	}

	private _initPhyBody(){
		// 
		let body = this.phyBody;
		body.dbgShow=true;
		let h = this.stepHeight=0.5;
		body.addShape( new Sphere(h));
		/*
		body.addShape( new Sphere(0.5),new Vec3(0,0.8,0));
		body.addShape( new Sphere(0.5),new Vec3(0,1.6,0));
		body.addShape( new Sphere(0.5),new Vec3(0,2.4,0));
		*/
		body.userData=this;
		body.position.set(0,10,0);
		body.allowSleep=false;
		body.fixedRotation=true;
		body.material=this._mtl;
		//body.linearDamping=0.1;
		body.updateMassProperties();

		body.preCollision = this.onPhyPreCollision.bind(this);

        let world = CannonWorld.inst.world
		world.addBody(body);

		body.addEventListener(Body.EVENT_COLLIDE_ENTER, this.onCollide.bind(this));
		body.addEventListener(Body.EVENT_COLLIDE_EXIT,this.onExitCollide.bind(this));

		/*
		let body1 = this.phyBody1;
		body1.addShape(new Sphere(h));
		body1.position.set(0,13,0);
		body1.allowSleep=false;
		body1.fixedRotation=true;
		world.addBody(body1);
		*/
	}

	/** 每帧调用 */
	onPhyPreCollision(){
		let b = this.phyBody;
		//this.lastVel.copy(b.velocity);
		//b.force.vadd(new Vec3(0,-10,0), b.force);

		let curpos = this.phyBody.position;
		let tarpos = this.targetPos;
		// 希望一帧就补偿摩擦损失
		let d = new Vec3(); //TODO temp
		tarpos.vsub(curpos,d);
		let l = d.length();
		if(l>0){
			let m = this.phyBody.mass;
			let t = 1/60;
			let t2 = t*t;
			// 力的大小
			let fl = 0.0*l*2*m/t2;
			let k = fl/l;
			d.x*=k;
			d.y*=k;
			d.z*=k;
			b.force.vadd(d,b.force);
		}

		//this.spring.applyForce();
	}

	onCollide(colEvt:PhyCollideEvent){
		//console.log('onclide',(colEvt.otherBody as Body).id);
		let c = colEvt.contact;
		let body = this.phyBody;
		//TEMP
		//body.velocity.set(0,0,0);
		body.angularVelocity.set(0,0,0);
		//this.state=0;
		if(c){
			if(c.body.isTrigger){
				console.log('enter trigger', c.othershape);
			}
		}
	}

	onExitCollide(colEvt:PhyCollideEvent){
		let body = this.phyBody;
		let c = colEvt.contact;
		let vel = body.velocity.length();
		if(body.contact.allcLen>0 || vel<6){
			//body.velocity.set(0,0,0);
		}
		//this.state=1;
		//console.log('exitcollide',c.otherBody, body.velocity);
		if(c){
			if(c.body.isTrigger){
				console.log('exit trigger', c.othershape);
			}
		}
	}

    applyPose(){
		let body = this.phyBody;
		let v = body.velocity;
		let contact = body.contact;
		let phyr = (body.world as World).phyRender;
		//v.copy(this.lastVel);
		if( contact.allcLen>0){
			//v.set(0,0,0);
			for(let i=0; i<contact.allcLen; i++){
				let c = contact.allc[i];
				//console.log(c.hitnorm)
				//phyr.addVec1(body.position, c.hitnorm, 10,0xffff0000);
			}
		}

		//console.log('vel:',v.x|0,v.y|0,v.z|0);

		//body.vlambda;
		//body.velocity.set(0,0,0);
		//let body1 = this.phyBody1;
		//body1.position.x=body.position.x;
		//body1.position.z=body.position.z;
	}

	set curDir(v:number){
		this._curDir=v;
		let v1 = (v+90)*Math.PI/180;	// z朝外

		this._lineVel.x=this.curVel*Math.cos(v1);
		this._lineVel.z=this.curVel*Math.sin(v1);
	}

	get curDir(){
		return this._curDir;
	}

	set curVDir(v:Vec3){
		let vl = this.curVel;
		this._lineVel.set(v.x*vl,v.y*vl,v.z*vl);
	}

	get lineVel(){
		return this._lineVel as any as Vector3;
	}

	set friction(f:number){
		this._friction=f;
		this._mtl.friction=f;
	}
	get friction(){
		return this._friction;
	}
	/**
	 * 禁止的话，则认为有无限摩擦力
	 * 只有在特殊状态下：例如斜坡上，才打开摩擦
	 * @param b 
	 */
	enableFriction(b:boolean){
		if(b){
			this._mtl.friction=this._friction;
		}else{
			this._mtl.friction=Material.infiniteFriction;
		}
	}

	addCenterForce(f: Vector3): void {
		throw new Error("Method not implemented.");
	}
	addForce(f: Vector3, pos: Vector3): void {
		throw new Error("Method not implemented.");
	}
	setWalkDir(x: number, y: number, z: number): void {
		throw new Error("Method not implemented.");
	}
	setPos(x: number, y: number, z: number): void {
		this.pos.set(x,y,z);
		this.targetPos.set(x,y,z);
		this.phyBody.position.set(x,y+this.stepHeight,z);
		//this.phyBody1.position.set(x,y+this.stepHeight+2,z)
	}
	setUpDir(up: Vector3): void {
		throw new Error("Method not implemented.");
	}

	jump(dir: Vector3): void {
		//this.lineVel.setValue(dir.x,dir.y,dir.z);
		this.phyBody.velocity.set(dir.x,dir.y,dir.z);
	}

	preStep(): void {
		throw new Error("Method not implemented.");
	}

	step(dt: number): void {
		let phbody = this.phyBody;
		/** 期望速度矢量 */
		let vel = this._lineVel;
		//this.phyBody.velocity.set(vel.x,vel.y,vel.z);
		this.targetPos.vadd(vel,this.targetPos);

		/** 实际速度矢量 */
		let rvel = phbody.velocity;
		let lvel = this.curVel;

		let allc = phbody.contact.allc;

		if(true){//this.phyBody.contact.allcLen>0){
			// 看看当前朝向的分量是否满足指定速度，不满足的话，就补充到目标速度
			// 大于指定速度的话，则不管？
			let dot = (vel.x*rvel.x+vel.y*rvel.y+vel.z*rvel.z)/lvel;	// vel的长度是curVel，所以要除掉
			let dv = lvel-dot;
			if(dv>0){
				let k = dv/lvel;
				rvel.x += k*vel.x;
				rvel.y += k*vel.y;
				rvel.z += k*vel.z;
			}
		}
		/*
		let pos = this.pos;
		let phypos = this.phyBody.position;
		phypos.x+=vel.x*dt;
		phypos.y+=vel.y*dt;
		phypos.z+=vel.z*dt;
		*/
	}
	move(step: Vector3): void {
		throw new Error("Method not implemented.");
	}
	enablePhy(b: boolean): void {
		throw new Error("Method not implemented.");
	}	
}