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
	chassisBox:new Vec3(2/2,0.791/2,4.68/2),	//
	chassisBoxPos:new Vec3(0.00716, 0.570108, -0.170404),	// 这是相对原点的，需要根据center转换
	mass:1500,
	单轮拉力:10000,
	脚刹力:1000,
	手刹力:100,
	radius:0.4,
	悬挂平时长度:0.2,
	悬挂最大移动范围:0.3,		// 在正负v之间
	悬挂提供的最大力:100000,		// 支撑底盘
	悬挂硬度:30,					// 弹性系数
	悬挂压缩阻尼:4.4,				// 阻尼系数，阻止车的震动的能力
	悬挂放松阻尼:2.3,
	侧滑翻滚系数:0.1,			// 0的时候，侧滑力会施加到中心，不易翻滚，1的时候，侧滑力施加在轮胎接触点，基本上一拐弯就翻车
	滑动时轮胎转速:-30,			// 弧度/秒 ？	
	开启滑动时轮胎转速:true,
	轮胎静摩擦系数:4,			// 悬挂力*这个系数决定了抓地能力。受力超过这个限制就开始打滑
	最大速度:300,				// km/h
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

	// 车身
	chassis:MeshSprite3D;
	chassisoffq = new Quaternion();
	chassisoffp = new Vec3();		// 车身偏移，即重心的位置取反。车身的原点在000

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

	/**
	 * 
	 * @param data 
	 * @param renderModel 如果传入这个参数，则不再自己加载。外部负责加载并加到场景中。模型必须符合制定的规则。
	 */
	parse(data:typeof carData, renderModel:Sprite3D|null){
		this.carData=data;

		// 创建物理对象
		var options = {
			radius: carData.radius,
			directionLocal: new Vec3(0, -1, 0),
			suspensionStiffness: carData.悬挂硬度,
			suspensionRestLength: carData.悬挂平时长度,
			frictionSlip: carData.轮胎静摩擦系数,
			dampingRelaxation: carData.悬挂放松阻尼,
			dampingCompression: carData.悬挂压缩阻尼,
			maxSuspensionForce: carData.悬挂提供的最大力,
			rollInfluence:  carData.侧滑翻滚系数,
			axleLocal: new Vec3(1, 0, 0),
			chassisConnectionPointLocal: new Vec3(1, 0,1),
			maxSuspensionTravel: carData.悬挂最大移动范围,
			customSlidingRotationalSpeed: carData.滑动时轮胎转速,
			useCustomSlidingRotationalSpeed: true,
			isFrontWheel:true
		};
		//let chassisBody = addBox( new Vec3(1.8,0.5,4), new Vec3(-5,7,0),carData.mass,cmtl1);
		let chassisBody = new Body(data.mass);
		let chassisOff = new Vec3();
		carData.chassisBoxPos.vsub(carData.center,chassisOff);
		chassisBody.addShape(new Box(carData.chassisBox), chassisOff);
		chassisBody.allowSleep=false;	//TODO 现在加力不能唤醒，先禁止sleep
		chassisBody.position.copy(carData.center);
	
		var car = this.phyCar = new RaycastVehicle(chassisBody);
		car.maxSpeed=carData.最大速度;
	
		// 前轮，方向
		options.isFrontWheel=true;
		carData.flpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		carData.frpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		// 后轮，动力
		options.isFrontWheel=false;
		carData.rlpos.vsub(carData.center,options.chassisConnectionPointLocal);
		car.addWheel(options);
	
		carData.rrpos.vsub(carData.center,options.chassisConnectionPointLocal);
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
			Sprite3D.load(data.modelUrl,Handler.create(this,this.onModelLoaded));
		}		
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
		this.chassis=chassis;
		this.wheels[0]=wheelfl;
		this.wheels[1]=wheelfr;
		this.wheels[2]=wheelrl;
		this.wheels[3]=wheelrr;

		// 计算偏移。 
		let rquat = chassis.transform.rotation;
		this.chassisoffq.set(rquat.x,rquat.y,rquat.z,rquat.w);

		let offq = this.wheelsOffQuat[0];
		rquat = wheelfl.transform.rotation;
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

	enable(){
	}

	// 加油前进
	accel(k:number){
		let maxForce = this.carData.单轮拉力;
		this.phyCar.applyEngineForce(-maxForce*k, 2);
		this.phyCar.applyEngineForce(-maxForce*k, 3);
	}

	// 后退
	reversing(k:number){
		let maxForce = this.carData.单轮拉力;
		this.phyCar.applyEngineForce(maxForce*k, 2);
		this.phyCar.applyEngineForce(maxForce*k, 3);
	}

	// 方向盘。v=0是直行。单位是弧度
	steer(v:number){
		this.phyCar.setSteeringValue(v, 0);
		this.phyCar.setSteeringValue(v, 1);
	}

	// 手刹
	handbrake(f:number|null){
		if(f==null||f==undefined){
			f=this.carData.手刹力;
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
			let force = carData.脚刹力;
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
		if(this.chassis){
			let phypos = car.chassisBody.position;
			let phyquat = car.chassisBody.quaternion;
			let rpos = this.chassis.transform.position;
			let rquat = this.chassis.transform.rotation;
			let poff = carData.center;
			var npoff = Car.tmpV1;
			phyquat.vmult(poff,npoff)
			rpos.setValue(phypos.x-npoff.x,phypos.y-npoff.y,phypos.z-npoff.z);
			this.chassis.transform.position=rpos;

			phyquat.mult(this.chassisoffq,tempQ);
			rquat.x = tempQ.x;rquat.y = tempQ.y;rquat.z = tempQ.z;rquat.w = tempQ.w;
			this.chassis.transform.rotation=rquat;

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
}
