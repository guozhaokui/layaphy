import { Component } from "laya/components/Component";
import { Matrix3x3 } from "laya/d3/math/Matrix3x3";
import { Vector3 } from "laya/d3/math/Vector3";
import { HitResult } from "laya/d3/physics/HitResult";
import { PhysicsComponent } from "laya/d3/physics/PhysicsComponent";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";
import Shape from "../shapes/Shape";
import { Ray } from "laya/d3/math/Ray";

export interface IPhyWorld{
	rayCastAll(ray: Ray, out: HitResult[], distance: number /*Int.MAX_VALUE*/, collisonGroup: number, collisionMask: number): boolean ;
	raycast(start:Vector3,dir:Vector3,len:number):HitResult;
	shapeCast():HitResult;
}

/**
 * 物理对象的接口
 */
export interface IPhyBody {
	mass:number;
	lineVel:Vector3;
	angVel:Vector3;
	gravity:Vector3|null;		//每个角色自己可以控制重力,如果为空，则使用全局的
	noRotate:boolean;//=true;				//是否允许旋转
	collisionGroup:int;//=0x0;			//碰撞组
	canCollideWith:int;//collisionMask=0xffffffff; 这个名字是为了与 PhysicsComponent 兼容
	/** 控制是否使用物理 */
	enablePhy(b:boolean):void;	
	addCenterForce(f:Vector3):void;
	addForce(f:Vector3, pos:Vector3):void;
}

/**
 * 控制角色的，不可以控制车，飞机等
 * 形状是一个刚体物理，如果发生碰撞，取这个刚体的位置，但是忽略速度
 * 提供位置，阻挡，碰撞信息。不提供碰撞盒子，挂件等功能。
 */
export interface ICharactorCtrl extends IPhyBody{
	canJump:boolean;//=false;
	gravity:Vector3;
	enableGravity:boolean;//=true;
	shape:ColliderShape;	// 自身形状。对人来说是胶囊
	turnAngle:number;		// 每次旋转的角度
	linearDamping:number;//=0;	// 线性阻尼
	angularDamping:number;//=0;
	stepAlignGround:boolean;//=true;	// 在斜坡上的时候根据地面法线调整step矢量
	maxSlope:number;
	stepHeight:number;				// 不存在的高度，不至于被一个小石子垫高
	state:int;

	/**
	 * 发生碰撞了
	 */
	onCollisionEnter:(other:ColliderShape,pos:Vector3,normal:Vector3)=>void;
	onCollisionExit:(other:ColliderShape)=>void;

	/**
	 * 落地事件
	 */
	onGround:()=>void;

	/**
	 * 下落事件
	 */
	onFall:()=>void;

	/**
	 * 被推走
	 */
	onBePushed:()=>void;

	/**
	 * 沿着斜坡下滑
	 */
	onSlidingDown:()=>void;

	enablePhy(b:boolean):void;

	/**
	 * 设置行走方向
	 * @param x 
	 * @param y 
	 * @param z 
	 */
	setWalkDir(x:number,y:number,z:number):void

	/**
	 * 强制设置位置
	 * @param x 
	 * @param y 
	 * @param z 
	 */
	setPos(x:number,y:number,z:number):void;

	/**
	 * 设置向上的朝向，可以让人走在不平的地面
	 * @param up 
	 */
	setUpDir(up:Vector3):void;

	/**
	 * 
	 * @param dir 起跳速度
	 */
	jump(dir:Vector3):void
	
	/**
	 * 预检测
	 */
	preStep():void

	/**
	 * 走一步
	 * @param dt 
	 */
	step(dt:number):void

	/**
	 * 不改变方向的移动
	 * @param step 
	 */
	move(step:Vector3):void

	// 被带动
	// 被推走

	// bindShape(bone:string,shape:Shape,offmat:Matrix3x3):void

}