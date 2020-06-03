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
import { CharCtrlPhyState, PhyEvent, PhyOutEvent } from "./CharCtrlPhyState";
import { Ray, hitworldOptions, RayMode } from "../collision/Ray";

var posErr = new Vec3();
var testHeightRay = new Ray();

export class PhyCharactorCtrl extends Component implements ICharactorCtrl{
	private _mass: number;
	private _friction=0;
	private phyState:CharCtrlPhyState;
	continueDrive=false;	// 假设存在一个动力，能避免碰撞后的反弹

	get mass(){
		return this._mass;
	}
	set mass(m:number){
		//TODO
	}
	//private _mtl =new Material('ctrl',1,0);
	_mtl =new Material('ctrl',0.3,0);

	/** 当前朝向， +z为0 */
	_curDir:number=0;	
	/** 当前速度的值 */
	_curVel:number=10;

	/** 期望速度。只有get, 没有set，因为是根据速度和朝向设置的 */
	private _desVel =new Vec3();

	/** 实际速度，处在不断调整中 */
	private _realVel = new Vec3();

	/** 上一次的实际位置 */
	private _lastPos:Vec3 = new Vec3();
	
	/** 上一帧的目标位置 */
	private _targetPos = new Vec3();

	//// config ////
	/** 任何碰撞都会反弹 */
	asRigid=false;
	/** 空中的时候不反弹 */
	noBounceWhileJumping=true;

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
	canJump: boolean;	
	gravity: Vector3;
	enableGravity: boolean;
	shape: ColliderShape;
	turnAngle: number;
	linearDamping: number;
	angularDamping: number;
	stepAlignGround: boolean;
	maxSlope: number;
	stepHeight: number;
	state = 0;				//0 正常 1 空中
	distToGround=0;			// 当前距离地面的高度

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
		//TODO 改成不用刚体的
		/*
		body.collisionResponse=false; 
		body.addEventListener(Body.EVENT_COLLIDE_ENTER,()=>{
			debugger;
		});
		*/
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
		body.linearDamping=0.1;

		body.updateMassProperties();

		body.preCollision = this.onPhyPreCollision.bind(this);

        let world = CannonWorld.inst.world
		world.addBody(body);

		body.addEventListener(Body.EVENT_COLLIDE_ENTER, this.onCollide.bind(this));
		body.addEventListener(Body.EVENT_COLLIDE_EXIT,this.onExitCollide.bind(this));

		this.phyState = new CharCtrlPhyState(this.phyBody,this)

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
		let tarpos = this._targetPos;
		/*
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
		*/
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
		this.phyState.handlePhyState(PhyEvent.COLLIDE);
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
		if(body.contact && body.contact.allcLen>0 || vel<6){
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

	phyStateEvent(evt: PhyOutEvent){
		let owner = this.owner;
		switch(evt){
			case PhyOutEvent.FALLSTART:
				owner.event('FallStart');
				break;
			case PhyOutEvent.FALLSTOP:
				owner.event('FallStop');
				break;
		}
	}

	getGroundDist(maxdist:number){
		let curpos = this.phyBody.position;
		let phyRay = testHeightRay;
		let world = this.phyBody.world as World;
		phyRay.from.copy(curpos);
		phyRay.to.copy(curpos);
		phyRay.to.y-=maxdist;

		this.phyBody.enableRayTest=false;
		let options: hitworldOptions = { mode: RayMode.CLOSEST };
		if (phyRay.intersectWorld(world, options)) {
			let r = phyRay.result;
			//cb(r.hitPointWorld, r.hitNormalWorld);
			this.distToGround = r.distance
		}else{
			this.distToGround=1e10;
		}	
		this.phyBody.enableRayTest=true;
		return this.distToGround;
	}
	/**
	 * 根据期望的位置调整速度
	 */
	private updateVel1(){
		let phy = this.phyBody;
		let posE = posErr;

		let cpos = phy.position;
		this._targetPos.vsub(cpos,posE);
		let rvel = phy.velocity;// this._realVel;
		let desVel = this._desVel;

		//DEBUG
		//console.log(`updateVel:距离差${posE.x},实际速度${this._realVel.x}`);
		//posE.y=0;
		//DEBUG

		/* 补偿法
		let Kp = 0.01;
		if(phy.world){
			let dt = phy.world.default_dt;
			let vx = posE.x/dt;
			let vy = posE.y/dt;
			let vz = posE.z/dt;
			rvel.x=  desVel.x + Kp*vx;
			rvel.y= desVel.y+ Kp*vy;
			rvel.z= desVel.z+ Kp*vz;
			//phy.velocity.copy(rvel)
			//phy.velocity.copy(this._desVel);
		}
		*/

		//// 规则法
		console.log('desvel:', desVel );
		// 抵消弹起
		if(desVel.y<=0){
			if(rvel.y>0){
				rvel.y = (desVel.y+rvel.y)/2;
			}
		}
	}

	/**
	 * 根据期望的位置调整速度
	 */
	private updateVel(){
		let rvel = this.phyBody.velocity;
		if(this.phyState.isOnGround()){
			// 没有主观跳起，则y速度只能下落，不能弹起
			if(rvel.y>0)
				rvel.y=0;
		}
		let desVel = this._desVel;
		rvel.x = desVel.x;
		rvel.z = desVel.z;
	}	

    applyPose(){
		let body = this.phyBody;
		let tarVel = this._desVel;
		let v = body.velocity;
		let contact = body.contact;
		let phyr = (body.world as World).phyRender;
		//v.copy(this.lastVel);
		if( contact && contact.allcLen>0){
			//v.set(0,0,0);
			for(let i=0; i<contact.allcLen; i++){
				let c = contact.allc[i];
				//console.log(c.hitnorm)
				//phyr.addVec1(body.position, c.hitnorm, 10,0xffff0000);
			}
		}
		this.updateVel();
		this.phyState.tick();
		//console.log('vel:',v.x|0,v.y|0,v.z|0);
		//TEST
		//console.log('dist=',this.getGroundDist(100));
	}

	set curVel(v:number){
		this._curVel=v;
		if(v>0){
			this.friction=0;
		}else{
			this.friction=1;
		}
	}

	get curVel(){
		return this._curVel;
	}

	set curDir(v:number){
		this._curDir=v;
		let v1 = (v+90)*Math.PI/180;	// z朝外

		this._desVel.x=this._curVel*Math.cos(v1);
		this._desVel.z=this._curVel*Math.sin(v1);
	}

	get curDir(){
		return this._curDir;
	}

	set curVDir(v:Vec3){
		let vl = this._curVel;
		this._desVel.set(v.x*vl,v.y*vl,v.z*vl);
	}

	get lineVel(){
		return this._desVel as any as Vector3;
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
		this._targetPos.set(x,y,z);
		this.phyBody.position.set(x,y+this.stepHeight,z);
	}
	setUpDir(up: Vector3): void {
		throw new Error("Method not implemented.");
	}

	jump(dir: Vector3): void {
		//this.phyBody.velocity.set(dir.x,dir.y,dir.z);
		//this._desVel.set(dir.x,dir.y,dir.z);
		this.phyBody.velocity.y=dir.y;
		this.phyState.handlePhyState( PhyEvent.JUMP );
	}

	preStep(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * 主动控制角色走一步
	 * @param dt 
	 */
	step(dt: number): void {
		let phybody = this.phyBody;
		/** 期望速度矢量 */
		let vel = this._desVel;
		/** 期望能到达的位置。*/
		this._targetPos.addScaledVector(dt,vel,this._targetPos);

		/** 实际速度矢量 */
		let rvel = phybody.velocity;
		rvel.x=vel.x;
		rvel.z=vel.z;
	}

	move(step: Vector3): void {
		throw new Error("Method not implemented.");
	}
	enablePhy(b: boolean): void {
		throw new Error("Method not implemented.");
	}	

	_onAdded(){
	}
}