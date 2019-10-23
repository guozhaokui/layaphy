import { Component } from "laya/components/Component";
import { ICharactorCtrl } from "./PhyInterface";
import { Vector3 } from "laya/d3/math/Vector3";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";
import { Body } from "../objects/Body";
import { Sphere } from "../shapes/Sphere";
import { Material } from "../material/Material";

export class PhyCharactorCtrl extends Component implements ICharactorCtrl{
	private _mass: number;
	get mass(){
		return this._mass;
	}
	set mass(m:number){
		//TODO
	}
	private _mtl =new Material();
	lineVel: Vector3;
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
	onCollisionEnter: (other: ColliderShape, pos: Vector3, normal: Vector3) => void;
	onCollisionExit: (other: ColliderShape) => void;
	onGround: () => void;
	onFall: () => void;
	onBePushed: () => void;
	onSlidingDown: () => void;
	constructor(){
		super();
		this._initPhyBody();
	}

	private _initPhyBody(){
		// 
		let body = this.phyBody;
		body.fixedRotation=true;
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
	move(step: Vector3): void {
		throw new Error("Method not implemented.");
	}
	enablePhy(b: boolean): void {
		throw new Error("Method not implemented.");
	}	
}