import { Vec3 } from "../math/Vec3";
import { RaycastVehicle } from "./RaycastVehicle";
import { Body } from "./Body";
import { Box } from "../shapes/Box";
import { Quaternion } from "../math/Quaternion";
//laya的要作为外部依赖项
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Tween } from "laya/utils/Tween";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Handler } from "laya/utils/Handler";
import { Event } from "laya/events/Event";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { World } from "../world/World";
import { Ease } from "laya/utils/Ease";

var tempQ = new Quaternion();

// 车面向屏幕外面。位置是模型的全局坐标
export var carData={
	modelUrl:'res/car/car.lh',
	chassisNode:'SM_Veh_Convertable_01',
	wheelflNode:'Wheel_fl',
	wheelfrNode:'Wheel_fr',
	wheelrlNode:'Wheel_rl',
	wheelrrNode:'Wheel_rr',
	/**
	 * 重心。是整个车的原点，其他的位置都根据他来算
	 * 	1. 车身物理的shape根据这个来偏移
	 *  2. 车身模型根据这个来偏移：模型原点在000，所以移动模型的时候，要减去这个
	 */
	center:new Vec3(0,0.1,0),	
	chassisBox:new Vec3(2/2,0.691/2,4.68/2),	//
	chassisBoxPos:new Vec3(0.00716, 0.670108, -0.170404),	// 这是相对原点的，需要根据center转换
	mass:1500,
	/** 单轮拉力 */
	DanLunLaLi:10000,
	/** 脚刹力 */
	JiaoShaLi:1000,
	/** 手刹力 */
	ShouShaLi:100,
	radius:0.4,
	/** 悬挂平时长度:0.2, */
	suspensionRestLength:0.2,
	/** 悬挂最大移动范围:0.3 */
	maxSuspensionTravel:0.3,		// 在正负v之间
	/** 悬挂提供的最大力 */
	maxSuspensionForce:100000,		// 支撑底盘
	/** 悬挂硬度 */
	suspensionStiffness:30,					// 弹性系数
	/** 悬挂压缩阻尼 */
	dampingCompression:4.4,				// 阻尼系数，阻止车的震动的能力
	/** 悬挂放松阻尼 */
	dampingRelaxation:2.3,
	/** 侧滑翻滚系数 */
	rollInfluence:0.1,			// 0的时候，侧滑力会施加到中心，不易翻滚，1的时候，侧滑力施加在轮胎接触点，基本上一拐弯就翻车
	/** 滑动时轮胎转速 */
	customSlidingRotationalSpeed:-30,			// 弧度/秒 ？	
	/** 开启滑动时轮胎转速 */
	useCustomSlidingRotationalSpeed:true,
	/** 轮胎静摩擦系数 */
	StaticFric:4,			// 悬挂力*这个系数决定了抓地能力。受力超过这个限制就开始打滑
	/** 最大速度 */
	MaxSpeed:300,				// km/h
	flpos:new Vec3(0.773268, 0.406936, 1.41364),	// 相对原点的
	frpos:new Vec3(-0.773268, 0.406936, 1.41364),
	rlpos:new Vec3(0.773268, 0.406936, -1.5505),
	rrpos:new Vec3(-0.773268, 0.406936, -1.5505),
}


	/*
	Laya.loader.create("url",Handler.create(null,function(mesh:Mesh):void{
		var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
		var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
		meshSprite3D.meshRenderer.sharedMaterial = mat;
		meshSprite3D.getChildByName
	}),null,Loader.MESH)
	*/


export class Car{
	private static tmpV1:Vec3=new Vec3();

	scene3D:Scene3D;
	world:World;

	carData:typeof carData;

	/** 控制车身的根节点。可能不是车身模型，例如可能有好几层父子关系，为了给外部方便获取位置，需要设置根节点。缺省是设置的车身 */
	renderRoot:Sprite3D;
	renderRootOffq = new Quaternion();
	//chassisoffp = new Vec3();		// 车身偏移，即重心的位置取反。车身的原点在000

	// 轮胎
	wheels:MeshSprite3D[]=[];	// TODO 对于轮子可以做到不需要这个。
	wheelsOffQuat:Quaternion[]=[];

	// 调试轨迹
	private wheelstrackf:Vec3[]=[];	// 前轮
	private wheelstrackr:Vec3[]=[];	// 后轮
	private wheelstrackslid:Vec3[]=[];	// 侧滑
	private tracklen=1000;

	// 刹车tween
	private wheelBrake:Tween[]=[];
	private isBraking=false;

	phyCar:RaycastVehicle;

	showTrack=false;
	showCenter=false;

	onUpdatePoseEnd:(pos:Vec3, quat:Quaternion)=>void;

	constructor(sce:Scene3D,world:World){
		this.scene3D=sce;
		this.world=world;
	}

	set showSlideForce(b:boolean){
		this.phyCar.dbgShowSlideForce=b;
	}
	get showSlideForce(){
		return this.phyCar.dbgShowSlideForce;
	}

	set showSuspForce(b:boolean){
		this.phyCar.dbgShowSuspForce=b;
	}

	get showSuspForce(){
		return this.phyCar.dbgShowSuspForce;
	}

	set showDriveForce(b:boolean){
		this.phyCar.dbgShowDriveForce=b;
	}
	get showDriveForce(){
		return this.phyCar.dbgShowDriveForce;
	}

	/**
	 * 
	 * @param data 
	 * @param renderModel 如果传入这个参数，则不再自己加载。外部负责加载并加到场景中。模型必须符合制定的规则。
	 */
	parse(data:typeof carData, renderModel:Sprite3D|null){
		this.carData=data;

		// 创建物理对象
		var options = {
			radius: data.radius,
			directionLocal: new Vec3(0, -1, 0),
			suspensionStiffness: data.suspensionStiffness,
			suspensionRestLength: data.suspensionRestLength,
			frictionSlip: data.StaticFric,
			dampingRelaxation: data.dampingRelaxation,
			dampingCompression: data.dampingCompression,
			maxSuspensionForce: data.maxSuspensionForce,
			rollInfluence:  data.rollInfluence,
			axleLocal: new Vec3(1, 0, 0),
			chassisConnectionPointLocal: new Vec3(1, 0,1),
			maxSuspensionTravel: data.maxSuspensionTravel,
			customSlidingRotationalSpeed: data.customSlidingRotationalSpeed,
			useCustomSlidingRotationalSpeed: true,
			isFrontWheel:true
		};
		//let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(-5,7,0),carData.mass,cmtl1);
		let chassisBody = new Body(data.mass);
		let chassisOff = new Vec3();
		data.chassisBoxPos.vsub(data.center,chassisOff);
		chassisBody.addShape(new Box(data.chassisBox), chassisOff);
		chassisBody.allowSleep=false;	//TODO 现在加力不能唤醒，先禁止sleep
		chassisBody.position.copy(data.center);
	
		var car = this.phyCar = new RaycastVehicle(chassisBody);
		car.maxSpeed=data.MaxSpeed;
	
		// 前轮，方向
		options.isFrontWheel=true;
		data.flpos.vsub(data.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		data.frpos.vsub(data.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		// 后轮，动力
		options.isFrontWheel=false;
		data.rlpos.vsub(data.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		data.rrpos.vsub(data.center,options.chassisConnectionPointLocal);
		car.addWheel(options);	
	
		this.wheelsOffQuat=[new Quaternion(), new Quaternion(), new Quaternion(), new Quaternion()];
		this.wheelBrake.length = car.wheelInfos.length;		

		car.addToWorld(this.world);
	
		this.world.addEventListener('postStep', ()=>{
			this.updatePose();
		});	

		if(renderModel){
			this.onModelLoaded(renderModel,false);
		}else{
			// 加载渲染对象
			data.modelUrl && Sprite3D.load(data.modelUrl,Handler.create(this,this.onModelLoaded));
		}		
	}

	/** 获得当前速度，单位是Km/H */
	getSpeed(){
		return this.phyCar.currentVehicleSpeedKmHour;
	}

	onModelLoaded(model:Sprite3D, addtoSce:boolean=true){
		if(addtoSce)
			this.scene3D.addChild(model);	//TODO

		let dt = this.carData;
		let chassis = model.getChildByName( dt.chassisNode ) as MeshSprite3D;
		let wheelfl = model.getChildByName( dt.wheelflNode ) as MeshSprite3D;
		let wheelfr = model.getChildByName( dt.wheelfrNode ) as MeshSprite3D;
		let wheelrl = model.getChildByName( dt.wheelrlNode ) as MeshSprite3D;
		let wheelrr = model.getChildByName( dt.wheelrrNode ) as MeshSprite3D;
		this.wheels[0]=wheelfl;
		this.wheels[1]=wheelfr;
		this.wheels[2]=wheelrl;
		this.wheels[3]=wheelrr;

		this.setRootObj(chassis);

		// 计算偏移。 

		let offq = this.wheelsOffQuat[0];
		let rquat = wheelfl.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[1];
		rquat = wheelfr.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[2];
		rquat = wheelrl.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		offq = this.wheelsOffQuat[3];
		rquat = wheelrr.transform.rotation;
		offq.set(rquat.x,rquat.y,rquat.z,rquat.w);
	}

	/**
	 * 设置根渲染对象。物理对渲染的控制就是通过这个对象进行的。
	 * @param s 
	 */
	setRootObj(s:Sprite3D){
		this.renderRoot=s;
		// 车身主偏移。在物理和显示重合的情况下，显示的旋转
		let rquat = s.transform.rotation;
		this.renderRootOffq.set(rquat.x,rquat.y,rquat.z,rquat.w);
	}

	enable(){
	}

	// 加油前进
	accel(k:number){
		let maxForce = this.carData.DanLunLaLi;
		this.phyCar.applyEngineForce(-maxForce*k, 2);
		this.phyCar.applyEngineForce(-maxForce*k, 3);
	}

	// 后退
	reversing(k:number){
		let maxForce = this.carData.DanLunLaLi;
		this.phyCar.applyEngineForce(maxForce*k, 2);
		this.phyCar.applyEngineForce(maxForce*k, 3);
	}

	// 方向盘。v=0是直行。单位是弧度
	steer(v:number,isDeg:boolean=false){
		if(isDeg){
			v= v*Math.PI/180;
		}
		this.phyCar.setSteeringValue(v, 0);
		this.phyCar.setSteeringValue(v, 1);
	}

	// 手刹
	handbrake(f:number|null){
		if(f==null||f==undefined){
			f=this.carData.ShouShaLi;
		}
		this.phyCar.setBrake(f, 2);
		this.phyCar.setBrake(f, 3);
	}

	// 刹车
	brake(b:boolean){
		if(b==this.isBraking)
			return;
		this.isBraking=b;
		let phy = this.phyCar;
		let n = this.wheelBrake.length;
		for(let i=0; i<n; i++){
			let tn = this.wheelBrake[i];
			if(tn){
				 tn.clear();
			}else{
				tn = this.wheelBrake[i] = new Tween();	
			}
		}

		if(b){
			let force = this.carData.JiaoShaLi;
			for(let i=0; i<n; i++){
				let tn = this.wheelBrake[i];
				tn.to(phy.wheelInfos[i], {brake:force},2000,Ease.linearInOut);
			}
		}else{
			phy.setBrake(0,0);		
			phy.setBrake(0,1);
			phy.setBrake(0,2);
			phy.setBrake(0,3);
		}
	}

	updatePose(){
		let car = this.phyCar;
		if(this.renderRoot){
			let phypos = car.chassisBody.position;
			let phyquat = car.chassisBody.quaternion;
			let rpos = this.renderRoot.transform.position;
			let rquat = this.renderRoot.transform.rotation;
			let poff = this.carData.center;
			var npoff = Car.tmpV1;
			phyquat.vmult(poff,npoff)
			rpos.setValue(phypos.x-npoff.x,phypos.y-npoff.y,phypos.z-npoff.z);
			this.renderRoot.transform.position=rpos;

			phyquat.mult(this.renderRootOffq,tempQ);
			rquat.x = tempQ.x;rquat.y = tempQ.y;rquat.z = tempQ.z;rquat.w = tempQ.w;
			this.renderRoot.transform.rotation=rquat;

			if(this.onUpdatePoseEnd){
				this.onUpdatePoseEnd(phypos,phyquat)
			}
		}

		for (var i = 0; i < car.wheelInfos.length; i++) {
			let wheelr = this.wheels[i];
			if(!wheelr)
				continue;
			let wheeloffq = this.wheelsOffQuat[i];
			car.updateWheelTransform(i);
			var t = car.wheelInfos[i].worldTransform;
			let phypos = t.position;
			let phyquat = t.quaternion;
			let rtranns = wheelr.transform;
			let rpos = rtranns.position;
			let rquat = rtranns.rotation;
			rpos.setValue(phypos.x,phypos.y,phypos.z);
			rtranns.position=rpos;
			phyquat.mult(wheeloffq,tempQ);
			rquat.x=tempQ.x; rquat.y=tempQ.y; rquat.z=tempQ.z; rquat.w=tempQ.w;
			rtranns.rotation=rquat;

			let wheelinfo = car.wheelInfos[i];
			if(wheelinfo.sliding){
				this.wheelstrackslid.push(wheelinfo.raycastResult.hitPointWorld.clone());
				if(this.wheelstrackslid.length>this.tracklen){
					this.wheelstrackslid.shift();
				}
			}else{
				if(wheelinfo.isInContact && this.showTrack){
					if(wheelinfo.isFrontWheel){
						this.wheelstrackf.push(wheelinfo.raycastResult.hitPointWorld.clone());
						if(this.wheelstrackf.length>this.tracklen){
							this.wheelstrackf.shift();
						}
					}else{
						this.wheelstrackr.push(wheelinfo.raycastResult.hitPointWorld.clone());
						if(this.wheelstrackr.length>this.tracklen){
							this.wheelstrackr.shift();
						}
					}
				}
			}
			/*
			var wheelBody = wheelBodies[i];
			wheelBody.position.copy(t.position);
			wheelBody.quaternion.copy(t.quaternion);
			*/
		}

		let phyr = this.world.phyRender;
		if(this.showTrack){
			this.wheelstrackf.forEach((v:Vec3)=>{
				phyr.addVec(v.x,v.y,v.z,0,.1,0,0xff6666);
			});
			this.wheelstrackr.forEach((v:Vec3)=>{
				phyr.addVec(v.x,v.y,v.z,0,.1,0,0x66ff66);
			});
			this.wheelstrackslid.forEach((v)=>{
				phyr.addVec(v.x,v.y,v.z,0,.2,0,0x000000);
			});
		}

		if(this.showCenter)
			phyr.addPoint1(this.phyCar.chassisBody.position, 0xff0000)

	}

	op_steerLeft=false;
	op_steerRight=false;
	op_acc=false;
	op_rev=false;
	op_handbrake=false;
	op_brake=false;

	onkeyEvent(e:Event,down:boolean){
		switch (e.keyCode) {
			case 38: // forward
				this.op_acc=down;
				break;
			case 40: // backward
				this.op_rev=down;
				break;
	
			case 66: // b
				this.op_brake=down;
				break;
	
			case 'V'.charCodeAt(0):
				this.op_handbrake=down;
				break;
			case 39: // right
				this.op_steerRight=down;
				break;
	
			case 37: // left
				this.op_steerLeft=down;
				break;
			case 'R'.charCodeAt(0):
				this.phyCar.chassisBody.quaternion.set(0,0,0,1);
				break;
			case ' '.charCodeAt(0):
				/*
				car.wheelInfos[0].frictionSlip=0.01;
				car.wheelInfos[1].frictionSlip=0.01;
				car.wheelInfos[2].frictionSlip=0.01;
				car.wheelInfos[3].frictionSlip=0.01;
				*/
				break;
			default:
				break;
		}
		this.updateCtrl();
	}

	updateCtrl(){
		var maxSteerVal = 0.5;
		if(this.op_steerLeft){
			this.steer(maxSteerVal);
		}else if(this.op_steerRight){
			this.steer(-maxSteerVal);
		}else{
			this.steer(0);
		}

		if(this.op_acc){
			this.accel(1);
		}else if(this.op_rev){
			this.reversing(1);
		}else{
			this.accel(0);
		}

		if(this.op_brake){
			this.brake(true)
		}else if(this.op_handbrake){
			this.handbrake(null);
		}else{
			this.brake(false);
		}
	}

	// TODO 抽象一个物理接口。把复合物理对象（例如车）和简单物理对象统一处理。
	addForce(x:number, y:number, z:number):void{
		if(this.phyCar && this.phyCar.chassisBody){
			let f=this.phyCar.chassisBody.force;
			f.x+=x;
			f.y+=y;
			f.z+=z;
		}
	}
}
