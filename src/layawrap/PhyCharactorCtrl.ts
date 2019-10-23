import { Component } from "laya/components/Component";
import { ICharactorCtrl } from "./PhyInterface";
import { Vector3 } from "laya/d3/math/Vector3";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";
import { Body } from "../objects/Body";
import { Sphere } from "../shapes/Sphere";
import { Material } from "../material/Material";
import { Vec3 } from "../math/Vec3";
import { CannonWorld } from "./CannonWorld";

export class PhyCharactorCtrl extends Component implements ICharactorCtrl{
	private _mass: number;
	private _friction=0;
	get mass(){
		return this._mass;
	}
	set mass(m:number){
		//TODO
	}
	private _mtl =new Material('ctrl',1,0);

	/** 当前朝向， +z为0 */
	_curDir:number=0;	
	/** 当前速度的值 */
	curVel:number=10;

	_lineVel =new Vector3();// 只有get，没有set

	angVel: Vector3;
	noRotate: boolean;
	collisionGroup: number;
	canCollideWith: number;
	phyForTrigger:Body|null=null;
	/** 物理实体，有很大摩擦力，所以可以被传送带带走，可以被推走，可以下落 */
	phyBody:Body = new Body(1,new Sphere(0.5));
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
	state: number;
	pos = new Vec3();
	onCollisionEnter: (other: ColliderShape, pos: Vector3, normal: Vector3) => void;
	onCollisionExit: (other: ColliderShape) => void;
	onGround: () => void;
	onFall: () => void;
	onBePushed: () => void;
	onSlidingDown: () => void;
	constructor(){
		super();
		this._initPhyBody();
		this.curDir=0;
	}

	private _initPhyBody(){
		// 
		let body = this.phyBody;
		body.userData=this;
		body.position.set(0,10,0);
		body.allowSleep=false;
		body.fixedRotation=true;
		//body.linearDamping=0.1;
		body.updateMassProperties();

        let world = CannonWorld.inst.world
		world.addBody(body);
	}

    applyPose(){

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

	get lineVel(){
		return this._lineVel;
	}

	set friction(f:number){
		this._friction=f;
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
		this.phyBody.position.set(x,y,z);
	}
	setUpDir(up: Vector3): void {
		throw new Error("Method not implemented.");
	}
	jump(dir: Vector3): void {
		throw new Error("Method not implemented.");
	}
	preStep(): void {
		throw new Error("Method not implemented.");
	}

	step(dt: number): void {
		let pos = this.pos;
		let phypos = this.phyBody.position;
		let vel = this._lineVel;
		phypos.x+=vel.x*dt;
		phypos.y+=vel.y*dt;
		phypos.z+=vel.z*dt;
	}
	move(step: Vector3): void {
		throw new Error("Method not implemented.");
	}
	enablePhy(b: boolean): void {
		throw new Error("Method not implemented.");
	}	
}