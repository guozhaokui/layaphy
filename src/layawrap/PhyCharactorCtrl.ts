import { Component } from "laya/components/Component";
import { ICharactorCtrl } from "./PhyInterface";
import { Vector3 } from "laya/d3/math/Vector3";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";

export class PhyCharactorCtrl extends Component implements ICharactorCtrl{
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
}