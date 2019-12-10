import {Quaternion} from '../math/Quaternion.js';
import {Vec3} from '../math/Vec3.js';
import {World} from '../world/World.js';
import {Body} from './Body.js';
import {WheelInfo} from './WheelInfo.js';

const gAxle=new Vec3(1,0,0);
const gForward=new Vec3(0,0,-1);
/**
 * Vehicle helper class that casts rays from the wheel positions towards the ground and applies forces.
 * @class RaycastVehicle
 * @constructor
 * @param {object} [options]
 * @param {Body} [options.chassisBody] The car chassis body.
 * @param {integer} [options.indexRightAxis] Axis to use for right. x=0, y=1, z=2
 * @param {integer} [options.indexLeftAxis]
 * @param {integer} [options.indexUpAxis]
 */
export class RaycastVehicle {
    chassisBody:Body;

    /**
     * An array of WheelInfo objects.
     */
    wheelInfos:WheelInfo[] = [];

    /**
     * Will be set to true if the car is sliding.
     */
    sliding = false;

    world:World|null=null; // null 表示没有加到场景中

    /**
     * Index of the right axis, 0=x, 1=y, 2=z
     */
    //indexRightAxis:i32=0;

    /**
     * Index of the forward axis, 0=x, 1=y, 2=z
     */
    //indexForwardAxis:i32 = 2;

    /**
     * Index of the up axis, 0=x, 1=y, 2=z
     */
    //indexUpAxis:i32 = 1;

	/** 当前速度，单位是 Km/h */
    currentVehicleSpeedKmHour=0;
    preStepCallback:()=>void;

    constructor( chassisBody:Body, indexRightAxis:i32=1, indexForwardAxis:i32=0, indexUpAxis:i32=2 ) {
        this.chassisBody = chassisBody;
        //this.indexRightAxis = typeof (indexRightAxis) !== 'undefined' ? indexRightAxis : 1;
        //this.indexForwardAxis = typeof (indexForwardAxis) !== 'undefined' ? indexForwardAxis : 0;
        //this.indexUpAxis = typeof (indexUpAxis) !== 'undefined' ? indexUpAxis : 2;
    }

    /**
     * Add a wheel. For information about the options, see WheelInfo.
     * @param  [options]
     */
    addWheel(options = {}):i32 {
        const info = new WheelInfo(options);
        const index = this.wheelInfos.length;
        this.wheelInfos.push(info);
        return index;
    }

    /**
     * Set the steering value of a wheel.
     */
    setSteeringValue(value:f32, wheelIndex:i32):void {
        const wheel = this.wheelInfos[wheelIndex];
        wheel.steering = value;
    }

    /**
     * Set the wheel force to apply on one of the wheels each time step
     */
    applyEngineForce(value:f32, wheelIndex:i32):void {
        this.wheelInfos[wheelIndex].engineForce = value;
    }

    /**
     * Set the braking force of a wheel
     */
    setBrake(brake:number, wheelIndex:i32):void {
        this.wheelInfos[wheelIndex].brake = brake;
    }

    /**
     * Add the vehicle including its constraints to the world.
     */
    addToWorld(world:World):void {
        //const constraints = this.constraints;
        world.addBody(this.chassisBody);
        const that = this;
        this.preStepCallback = () => {
            that.updateVehicle(world.dt);
        };
        world.addEventListener('preStep', this.preStepCallback);
        this.world = world;
    }

    /**
     * Get one of the wheel axles, world-oriented.
     */
    getVehicleAxisWorld(axisIndex:i32, result:Vec3):void {
        result.set(
            axisIndex === 0 ? 1 : 0,
            axisIndex === 1 ? 1 : 0,
            axisIndex === 2 ? 1 : 0
		);
		result.set(1,0,0);
        this.chassisBody.vectorToWorldFrame(result, result);
    }

	/**
	 * 主逻辑
	 * @param timeStep 
	 */
    updateVehicle(timeStep:number) {
        const wheelInfos = this.wheelInfos;
        const numWheels = wheelInfos.length;
        const chassisBody = this.chassisBody;

        for (var i = 0; i < numWheels; i++) {
            this.updateWheelTransform(i);
        }

        this.currentVehicleSpeedKmHour = 3.6 * chassisBody.velocity.length();

        const forwardWorld = new Vec3();
		//this.getVehicleAxisWorld(this.indexForwardAxis, forwardWorld);
		this.chassisBody.vectorToWorldFrame(gForward, forwardWorld);

		// 判断前进还是后退
        if (forwardWorld.dot(chassisBody.velocity) < 0) {
            this.currentVehicleSpeedKmHour *= -1;
        }

        // simulate suspension
        for (var i = 0; i < numWheels; i++) {
            this.castRay(wheelInfos[i]);
        }

        this.updateSuspension(timeStep);

		/** 每个轮胎贡献的冲击力 */
        const impulse = new Vec3();
        const relpos = new Vec3();
        for (var i = 0; i < numWheels; i++) {
			//apply suspension force
			// 悬挂提供的力，影响底盘
            var wheel = wheelInfos[i];
            let suspensionForce = wheel.suspensionForce;
            if (suspensionForce > wheel.maxSuspensionForce) {
                suspensionForce = wheel.maxSuspensionForce;
            }
            wheel.raycastResult.hitNormalWorld.scale(suspensionForce * timeStep, impulse);

            wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, relpos);
            chassisBody.applyImpulse(impulse, relpos);
        }

        this.updateFriction(timeStep);

        const hitNormalWorldScaledWithProj = new Vec3();
        const fwd = new Vec3();
        const vel = new Vec3();
        for (i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            //var relpos = new Vec3();
            //wheel.chassisConnectionPointWorld.vsub(chassisBody.position, relpos);
            chassisBody.getVelocityAtWorldPoint(wheel.chassisConnectionPointWorld, vel);

			// Hack to get the rotation in the correct direction
			/*
            let m = 1;
            switch (this.indexUpAxis) {
                case 1:
                    m = -1;
                    break;
			}
			*/

			// 更新轮胎旋转
            if (wheel.isInContact) {

				//this.getVehicleAxisWorld(this.indexForwardAxis, fwd);
				this.chassisBody.vectorToWorldFrame(gForward, fwd);
                const proj = fwd.dot(wheel.raycastResult.hitNormalWorld);
                wheel.raycastResult.hitNormalWorld.scale(proj, hitNormalWorldScaledWithProj);

                fwd.vsub(hitNormalWorldScaledWithProj, fwd);

                const proj2 = fwd.dot(vel);
                wheel.deltaRotation = -proj2 * timeStep / wheel.radius;	// 如果转反了改-1
            }

            // 给油中，侧滑中，允许CustomSlidingRotationalSpeed 的情况下
            if ((wheel.sliding || !wheel.isInContact) && wheel.engineForce !== 0 && wheel.useCustomSlidingRotationalSpeed) {
                // Apply custom rotation when accelerating and sliding
                wheel.deltaRotation = (wheel.engineForce > 0 ? 1 : -1) * wheel.customSlidingRotationalSpeed * timeStep;
            }

            // Lock wheels
            if (Math.abs(wheel.brake) > Math.abs(wheel.engineForce)) {
                wheel.deltaRotation = 0;
            }

            wheel.rotation += wheel.deltaRotation; // Use the old value
            wheel.deltaRotation *= 0.99; // damping of rotation when not in contact
        }
    }

    updateSuspension(deltaTime:f32) {
        const chassisBody = this.chassisBody;
        const chassisMass = chassisBody.mass;
        const wheelInfos = this.wheelInfos;
        const numWheels = wheelInfos.length;

        for (let w_it = 0; w_it < numWheels; w_it++) {
            const wheel = wheelInfos[w_it];

            if (wheel.isInContact) {
                // Spring
                const length_diff = (wheel.suspensionRestLength - wheel.suspensionLength);
                let force = wheel.suspensionStiffness * length_diff * wheel.clippedInvContactDotSuspension;

                // Damper
                const projected_rel_vel = wheel.suspensionRelativeVelocity;
                let susp_damping;
                if (projected_rel_vel < 0) {
                    susp_damping = wheel.dampingCompression;
                } else {
                    susp_damping = wheel.dampingRelaxation;
                }
                // 阻尼与速度成正比
                force -= susp_damping * projected_rel_vel;

                wheel.suspensionForce = force * chassisMass;
                if (wheel.suspensionForce < 0) {
                    wheel.suspensionForce = 0;
                }
            } else {
                wheel.suspensionForce = 0;
            }
        }
    }

    /**
     * Remove the vehicle including its constraints from the world.
     */
    removeFromWorld(world:World) {
        //const constraints = this.constraints;
        world.remove(this.chassisBody);
        world.removeEventListener('preStep', this.preStepCallback);
        this.world = null;
    }

	/**
	 * wheel做射线检测
	 * @param wheel 
	 * @return 返回距离地面的高度，-1表示没有接触地面
	 */
    castRay(wheel:WheelInfo):number {
        if(!this.world)
			return -1;
		/** 射线朝向 */
		const rayvector = castRay_rayvector;
		/** 射线终点 */
		const target = castRay_target;
		
        wheel.isInContact = false;
        this.updateWheelTransformWorld(wheel);
        const chassisBody = this.chassisBody;

        let depth = -1;

		// 射线检测长度是悬挂缺省长度+轮胎半径
        const raylen = wheel.suspensionRestLength + wheel.radius;

        wheel.directionWorld.scale(raylen, rayvector);
        const source = wheel.chassisConnectionPointWorld;
        source.vadd(rayvector, target);
        const raycastResult = wheel.raycastResult;

        //const param = 0;

        raycastResult.reset();
		// Turn off ray collision with the chassis temporarily
		// 先关掉底盘的射线检测，测完再恢复
        const oldState = chassisBody.collisionResponse;
        chassisBody.collisionResponse = false;
        // Cast ray against world
        this.world.rayTest(source, target, raycastResult);
        chassisBody.collisionResponse = oldState;

        const object = raycastResult.body;
        raycastResult.groundObject = 0;
        if (object) {
			// 如果检测到物体了，表示轮胎接触地面
            wheel.isInContact = true;
            //wheel.raycastResult.hitNormalWorld = raycastResult.hitNormalWorld;

            depth = raycastResult.distance;
            wheel.suspensionLength = depth - wheel.radius;

            // clamp on max suspension travel
            const minSuspensionLength = wheel.suspensionRestLength - wheel.maxSuspensionTravel;
            const maxSuspensionLength = wheel.suspensionRestLength + wheel.maxSuspensionTravel;
            if (wheel.suspensionLength < minSuspensionLength) {
                wheel.suspensionLength = minSuspensionLength;
            }
            if (wheel.suspensionLength > maxSuspensionLength) {
				// 超过最大长度了 。 ？？
                wheel.suspensionLength = maxSuspensionLength;
                raycastResult.reset();
            }

			// 当前接触点的贡献值
            const denominator = raycastResult.hitNormalWorld.dot(wheel.directionWorld);

			// 当前接触点的速度
            const chassis_velocity_at_contactPoint = new Vec3();
            chassisBody.getVelocityAtWorldPoint(raycastResult.hitPointWorld, chassis_velocity_at_contactPoint);

			// 速度到碰撞法线的投影
            const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);

            if (denominator >= -0.1) {
                wheel.suspensionRelativeVelocity = 0;
                wheel.clippedInvContactDotSuspension = 1 / 0.1;
            } else {
                const inv = -1 / denominator;
                wheel.suspensionRelativeVelocity = projVel * inv;
                wheel.clippedInvContactDotSuspension = inv;
            }

        } else {

            //put wheel info as in rest position
            wheel.suspensionLength = wheel.suspensionRestLength + 0 * wheel.maxSuspensionTravel;
            wheel.suspensionRelativeVelocity = 0.0;
            wheel.directionWorld.scale(-1, raycastResult.hitNormalWorld);
            wheel.clippedInvContactDotSuspension = 1.0;
        }

        return depth;
    }

    updateWheelTransformWorld(wheel:WheelInfo) {
		const chassisBody = this.chassisBody;
		// 把轮子的相对连接点、上方向、轴都转到世界空间
		chassisBody.pointToWorldFrame(wheel.chassisConnectionPointLocal, wheel.chassisConnectionPointWorld);
        chassisBody.vectorToWorldFrame(wheel.directionLocal, wheel.directionWorld);
        chassisBody.vectorToWorldFrame(wheel.axleLocal, wheel.axleWorld);
    }

    /**
     * Update one of the wheel transform.
     * Note when rendering wheels: during each step, wheel transforms are updated BEFORE the chassis; ie. their position becomes invalid after the step. 
	 * Thus when you render wheels, you must update wheel transforms before rendering them. See raycastVehicle demo for an example.
     * @param wheelIndex The wheel index to update.
     */
    updateWheelTransform(wheelIndex:i32) {
        let up = tmpVec4;
        let right = tmpVec5;
        //let fwd = tmpVec6;

		let wheel = this.wheelInfos[wheelIndex];
		// 转到世界空间
        this.updateWheelTransformWorld(wheel);

		// 计算本地空间的前和右
        wheel.directionLocal.scale(-1, up);
        right.copy(wheel.axleLocal);
        //up.cross(right, fwd);
        //fwd.normalize();
        right.normalize();

		// 先在本地空间控制方向，然后再转到世界空间

		// Rotate around steering over the wheelAxle
        let steering = wheel.steering;
        let steeringOrn = new Quaternion();	//TODO 去掉new
        steeringOrn.setFromAxisAngle(up, steering);

        let rotatingOrn = new Quaternion();
        rotatingOrn.setFromAxisAngle(right, wheel.rotation);

		// World rotation of the wheel
		// 轮子的世界空间的旋转 = 底盘旋转*方向盘*轮子旋转
        let q = wheel.worldTransform.quaternion;
        this.chassisBody.quaternion.mult(steeringOrn, q);
        q.mult(rotatingOrn, q);
        q.normalize();

		// world position of the wheel
		// 位置=世界空间位置+悬挂偏移
        let p = wheel.worldTransform.position;
        p.copy(wheel.directionWorld);
        p.scale(wheel.suspensionLength, p);
        p.vadd(wheel.chassisConnectionPointWorld, p);
    }

    /**
     * Get the world transform of one of the wheels
     * @param   wheelIndex
     */
    getWheelTransformWorld(wheelIndex:number) {
        return this.wheelInfos[wheelIndex].worldTransform;
    }

    updateFriction(timeStep:number) {
        const surfNormalWS_scaled_proj = updateFriction_surfNormalWS_scaled_proj;

        //calculate the impulse, so that the wheels don't move sidewards
        const wheelInfos = this.wheelInfos;
        const numWheels = wheelInfos.length;
        const chassisBody = this.chassisBody;
        const forwardWS = updateFriction_forwardWS;
        const axle = updateFriction_axle;

        //let numWheelsOnGround:i32 = 0;

		// 初始化。 TODO 合并到下面
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];

            var groundObject = wheel.raycastResult.body;
            if (groundObject) {
                //numWheelsOnGround++;
            }

            wheel.sideImpulse = 0;
            wheel.forwardImpulse = 0;
            if (!forwardWS[i]) {
                forwardWS[i] = new Vec3();
            }
            if (!axle[i]) {
                axle[i] = new Vec3();
            }
        }

		// 计算每个轮胎的侧滑摩擦力
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];

            var groundObject = wheel.raycastResult.body;

            if (groundObject) {
				// 如果此轮胎接触地面的情况
                const axlei = axle[i];
                const wheelTrans = this.getWheelTransformWorld(i);

                // Get world axle
				//wheelTrans.vectorToWorldFrame(directions[this.indexRightAxis], axlei);
				wheelTrans.vectorToWorldFrame(gAxle, axlei);	// 轮轴

				// 下面计算axle和forward。

				/** 接触面法线 */
                const surfNormalWS = wheel.raycastResult.hitNormalWorld;
                const proj = axlei.dot(surfNormalWS);
                surfNormalWS.scale(proj, surfNormalWS_scaled_proj);	// axle投影到normal上的部分
                axlei.vsub(surfNormalWS_scaled_proj, axlei);	// 平行于接触面的分量，作为axle
                axlei.normalize();
				// 计算forward。如果axle=1,0,0, normal=0,1,0则forward指向 -z
                surfNormalWS.cross(axlei, forwardWS[i]);
                forwardWS[i].normalize();

				// 计算侧滑导致的摩擦力。沿着车轴方向
                wheel.sideImpulse = resolveSingleBilateral(
                    chassisBody,
                    wheel.raycastResult.hitPointWorld,
                    groundObject,
                    wheel.raycastResult.hitPointWorld,
                    axlei
                );

                wheel.sideImpulse *= sideFrictionStiffness2;
            }
        }

        const sideFactor = 1;
        const fwdFactor = 0.5;

        this.sliding = false;
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];
            var groundObject = wheel.raycastResult.body;

            let rollingFriction = 0;

            wheel.slipInfo = 1;
            if (groundObject) {
				const defaultRollingFrictionImpulse = 0;
				// maxImpulse=0或者刹车的力
                const maxImpulse = wheel.brake ? wheel.brake : defaultRollingFrictionImpulse;

                // btWheelContactPoint contactPt(chassisBody,groundObject,wheelInfraycastInfo.hitPointWorld,forwardWS[wheel],maxImpulse);
				// rollingFriction = calcRollingFriction(contactPt);
				// 刹车的情况下能提供的摩擦力
				rollingFriction = calcRollingFriction(chassisBody, groundObject, wheel.raycastResult.hitPointWorld, forwardWS[i], maxImpulse);
				// +引擎拉力
                rollingFriction += wheel.engineForce * timeStep;

                // rollingFriction = 0;
                var factor = maxImpulse / rollingFriction;
                wheel.slipInfo *= factor;
            }

            //switch between active rolling (throttle), braking and non-active rolling friction (nthrottle/break)

            wheel.forwardImpulse = 0;
            wheel.skidInfo = 1;

            if (groundObject) {
                //wheel.skidInfo = 1;

                const maximp = wheel.suspensionForce * timeStep * wheel.frictionSlip;
                const maximpSide = maximp;

                const maximpSquared = maximp * maximpSide;

                wheel.forwardImpulse = rollingFriction;//wheelInfo.engineForce* timeStep;

                const x = wheel.forwardImpulse * fwdFactor;
                const y = wheel.sideImpulse * sideFactor;

                const impulseSquared = x * x + y * y;

                wheel.sliding = false;
                if (impulseSquared > maximpSquared) {
					// 超过了最大冲量，则产生滑动了
                    this.sliding = true;
                    wheel.sliding = true;
                    wheel.skidInfo *= maximp / Math.sqrt(impulseSquared);	
                }
            }
        }

        if (this.sliding) {
			// 打滑的情况下，提供的动力会减少
            for (var i = 0; i < numWheels; i++) {
                var wheel = wheelInfos[i];
                if (wheel.sideImpulse !== 0) {
                    if (wheel.skidInfo < 1) {
                        wheel.forwardImpulse *= wheel.skidInfo;
                        wheel.sideImpulse *= wheel.skidInfo;
                    }
                }
            }
        }

        // apply the impulses
        for (var i = 0; i < numWheels; i++) {
            var wheel = wheelInfos[i];

            const rel_pos = new Vec3();
            wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, rel_pos);
            // cannons applyimpulse is using world coord for the position
            //rel_pos.copy(wheel.raycastResult.hitPointWorld);

            if (wheel.forwardImpulse !== 0) {
                const impulse = new Vec3();
                forwardWS[i].scale(wheel.forwardImpulse, impulse);
				chassisBody.applyImpulse(impulse, rel_pos);
				//DEBUG
				if(this.world){
					this.world.phyRender.addVec1(wheel.raycastResult.hitPointWorld,impulse,2,0xffff0000);
				}
				//DEBUG
            }

            if (wheel.sideImpulse !== 0) {
                var groundObject = wheel.raycastResult.body;
                if(groundObject){
                    const rel_pos2 = new Vec3();
                    wheel.raycastResult.hitPointWorld.vsub(groundObject.position, rel_pos2);
                    //rel_pos2.copy(wheel.raycastResult.hitPointWorld);
                    const sideImp = new Vec3();
                    axle[i].scale(wheel.sideImpulse, sideImp);
    
                    // Scale the relative position in the up direction with rollInfluence.
                    // If rollInfluence is 1, the impulse will be applied on the hitPoint (easy to roll over), if it is zero it will be applied in the same plane as the center of mass (not easy to roll over).
					chassisBody.vectorToLocalFrame(rel_pos, rel_pos);
					// rel_pos['xyz'[this.indexUpAxis]] *= wheel.rollInfluence;
					rel_pos.y *= wheel.rollInfluence;
                    //console.error('上面这句有问题，先删掉了');
                    chassisBody.vectorToWorldFrame(rel_pos, rel_pos);
                    chassisBody.applyImpulse(sideImp, rel_pos);
    
                    //apply friction impulse on the ground
                    sideImp.scale(-1, sideImp);
					groundObject.applyImpulse(sideImp, rel_pos2);
					//DEBUG
					if(this.world){
						this.world.phyRender.addVec1(wheel.raycastResult.hitPointWorld,sideImp,2,0xffff0000);
					}
					//DEBUG
                }
            }
        }
    }
}

//const tmpVec1 = new Vec3();
//const tmpVec2 = new Vec3();
//const tmpVec3 = new Vec3();
var tmpVec4 = new Vec3();
var tmpVec5 = new Vec3();
var tmpVec6 = new Vec3();
//const tmpRay = new Ray();

//const torque = new Vec3();

var castRay_rayvector = new Vec3();
var castRay_target = new Vec3();

var directions = [
    new Vec3(1, 0, 0),
    new Vec3(0, 1, 0),
    new Vec3(0, 0, 1)
];


var updateFriction_surfNormalWS_scaled_proj = new Vec3();
var updateFriction_axle:Vec3[] = [];
var updateFriction_forwardWS:Vec3[] = [];
var sideFrictionStiffness2 = 1;

const calcRollingFriction_vel1 = new Vec3();
const calcRollingFriction_vel2 = new Vec3();
const calcRollingFriction_vel = new Vec3();

/**
 * 计算保持不滑动需要的滚动摩擦力
 * @param body0 
 * @param body1 
 * @param frictionPosWorld 			接触点的坐标
 * @param frictionDirectionWorld 	前向量，就是摩擦力会产生的方向
 * @param maxImpulse 				最大冲力
 */
function calcRollingFriction(body0:Body, body1:Body, frictionPosWorld:Vec3, frictionDirectionWorld:Vec3, maxImpulse:f32) {
    let j1 = 0;
    const contactPosWorld = frictionPosWorld;

    // var rel_pos1 = new Vec3();
    // var rel_pos2 = new Vec3();
    const vel1 = calcRollingFriction_vel1;
    const vel2 = calcRollingFriction_vel2;
    const vel = calcRollingFriction_vel;
    // contactPosWorld.vsub(body0.position, rel_pos1);
    // contactPosWorld.vsub(body1.position, rel_pos2);

    body0.getVelocityAtWorldPoint(contactPosWorld, vel1);
	body1.getVelocityAtWorldPoint(contactPosWorld, vel2);
	// 碰撞点的相对速度
    vel1.vsub(vel2, vel);

	// 相对速度在摩擦力方向上的投影
    const vrel = frictionDirectionWorld.dot(vel);
	//console.log('vrel',vel.length());

    const denom0 = computeImpulseDenominator(body0, frictionPosWorld, frictionDirectionWorld);
    const denom1 = computeImpulseDenominator(body1, frictionPosWorld, frictionDirectionWorld);
    const relaxation = 1;
	const jacDiagABInv = relaxation / (denom0 + denom1);

	// calculate j that moves us to zero relative velocity
	// 为了达到相对速度为0需要的j
    j1 = -vrel * jacDiagABInv;

    if ( j1>maxImpulse) {
        j1 = maxImpulse;
    }
    if (j1 < -maxImpulse) {
        j1 = -maxImpulse;
    }

    return j1;
}

const computeImpulseDenominator_r0 = new Vec3();
const computeImpulseDenominator_c0 = new Vec3();
const computeImpulseDenominator_vec = new Vec3();
const computeImpulseDenominator_m = new Vec3();
/**
 * 计算body在pos位置，normal方向上的冲量的贡献量，这个位置和方向越容易引起旋转，则贡献越大？
 * @param body 
 * @param pos 
 * @param normal 
 */
function computeImpulseDenominator( body:Body, pos:Vec3, normal:Vec3) {
	/** r0 质心->pos */
    const r0 = computeImpulseDenominator_r0;
    const c0 = computeImpulseDenominator_c0;
    const vec = computeImpulseDenominator_vec;
    const m = computeImpulseDenominator_m;

    pos.vsub(body.position, r0);
	r0.cross(normal, c0);
	
    body.invInertiaWorld.vmult(c0,m);
    m.cross(r0, vec);

    return body.invMass + normal.dot(vec);
}


const resolveSingleBilateral_vel1 = new Vec3();
const resolveSingleBilateral_vel2 = new Vec3();
const resolveSingleBilateral_vel = new Vec3();

//bilateral constraint between two dynamic objects
function resolveSingleBilateral(body1:Body, pos1:Vec3, body2:Body, pos2:Vec3, normal:Vec3) {
    const normalLenSqr = normal.lengthSquared();
    if (normalLenSqr > 1.1) {
        return 0; // no impulse
    }
    // var rel_pos1 = new Vec3();
    // var rel_pos2 = new Vec3();
    // pos1.vsub(body1.position, rel_pos1);
    // pos2.vsub(body2.position, rel_pos2);

    const vel1 = resolveSingleBilateral_vel1;
    const vel2 = resolveSingleBilateral_vel2;
    const vel = resolveSingleBilateral_vel;
    body1.getVelocityAtWorldPoint(pos1, vel1);
    body2.getVelocityAtWorldPoint(pos2, vel2);

	// 两个点之间的相对速度
    vel1.vsub(vel2, vel);

	// 相对速度在normal上的大小
    const rel_vel = normal.dot(vel);

    const contactDamping = 0.2;
    const massTerm = 1 / (body1.invMass + body2.invMass);
    var impulse = - contactDamping * rel_vel * massTerm;

    return impulse;
}