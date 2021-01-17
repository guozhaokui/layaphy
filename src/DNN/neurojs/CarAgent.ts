import { stat } from "fs";
import { Car } from "../../objects/Car";
import { CarWorld } from "./CarWorld";
import { Plot } from "./Plot";
import { Agent } from "./rl/agent";

declare var neurojs:any;

/**
 * 简化：
 * 输入：8个
 * 当前朝向 eulary
 * 当前速度 vel
 * （其他特定参数：质量，摩擦等）
 * 到目标的距离 	相对空间  x,z
 * 目标路径的下一个距离	x,z
 * 目标路径的下下个距离	x,z
 * 
 * 输出
 * 加速，转向，刹车
 * n=2: acc:[-1,1], steer:[-1,1]
 * 
 * 评价
 * 	到路径的距离，速度
 * 
 * 
 * reward = -posdist+vel
 */	


class TestCar{
	px=100;
	pz=100;

	movx(dx:number){
		this.px+=dx;
	}

	movz(d:number){
		this.pz+=d;
	}
}

export class CarAgent{
	loss=0;
	reward=0;
	rewardBonus=0;

	timer=0;
	frequency=15;
	timerFrequency = 60/this.frequency;

	//car:Car;
	car = new TestCar();
	brain:Agent;

	options:any;
	world:CarWorld;
	outActions:Float64Array;

	static actions = 2;
	static statenum = 2;//quat,fSpeed,x0,z0 //,x1,z1,x2,z2
	static temporal=1;

	stateBuffer = new Float64Array(CarAgent.statenum);

	constructor(opt:any, world:CarWorld){
		this.options=opt;
		this.world=world;
		this.init();
	}

	init(){
		
		let states = CarAgent.statenum;
		//var input = neurojs.Agent.getInputDimension(states, actions, temporal)
		
		let agent:Agent =  new neurojs.Agent({
				states: states,
				actions: CarAgent.actions,
		
				algorithm: 'ddpg',
		
				temporalWindow: CarAgent.temporal, 
		
				discount: 0.95, 
		
				// 经验回放数量？
				experience: 75e3, 
				// 每次从buffer采样的个数
				learningPerTick: 40, 
				startLearningAt: 100,
		
				theta: 0.05, // progressive copy
				alpha: 0.1 // advantage learning
		});

		this.brain = agent;
		agent.algorithm.actor;

		this.world.brains!.shared!.add('actor', agent.algorithm.actor)
		this.world.brains!.shared!.add('critic', agent.algorithm.critic)
	
	}

	step(plot:Plot){
		this.timer++;
		//if (this.timer % this.timerFrequency === 0) {
			this.updateInput();
			let car = this.car;
			//let speed = car.getSpeed();
			this.reward = this.getReward() ;// f(vel, contac, impact)
			plot.addData(1,this.reward);
			//if(Math.abs(speed)<1e-2){
				// 不动的话得分低
			//	this.reward=-1;
			//}

			let loss = this.loss = this.brain.learn(this.reward) as number;

			if(loss)
				plot.addData(0,loss)

			let action = this.brain.policy(this.stateBuffer)
			if(action){
				this.outActions = action;
			}
			
			this.rewardBonus = 0.0
			//this.car.impact = 0			
		//}
		return this.loss;
	}

	updateInput(){
		let car = this.car;
		let stats = this.stateBuffer;
		stats[0]=car.px/1000;
		stats[1]=car.pz/1000;
		stats[2]=stats[3]=stats[4]=stats[5]=stats[6]=0
	}

	getReward(){
		let car = this.car;
		let dx = car.px;
		let dz = car.pz;
		let ln = Math.sqrt(dx*dx+dz*dz)/800;
		return -ln;
	}

	handleOut(){
		let actions = this.outActions;
		// 处理
		if(actions){
			this.car.movx(actions[0]);
			this.car.movz(actions[1]);
		}
	}


	handleOut1(){
		let actions = this.outActions;

		// 处理
		if(actions){
			this.car.accel(actions[0]);
			this.car.steer(actions[1]);
		}

	}

	getReward1(){
		let car = this.car;
		let body = car.phyCar.chassisBody;
		let pos = body.position;
		let quat = body.quaternion;
		let dx = pos.x;
		let dz = pos.z;
		let len = Math.sqrt(dx*dx+dz*dz);

		//return (-Math.abs(len-20))/100;
		return -len/800;
	}

	updateInput1(){
		let car = this.car;
		let body = car.phyCar.chassisBody;
		let pos = body.position;
		let quat = body.quaternion;
		let stats = this.stateBuffer;
		stats[0]=quat.x;stats[1]=quat.y;stats[2]=quat.z;stats[3]=quat.w;
		let v = car.getSpeed()/200;// body.velocity.length();
		stats[4]=v;
		stats[5]=pos.x/100;
		stats[6]=pos.z/100;
		// 圆形目标
	}

	/**
	 * 发生碰撞了。
	 * @param speed 
	 */
	onContact(speed:number){
		this.rewardBonus -= Math.max(50,speed);
	}
}