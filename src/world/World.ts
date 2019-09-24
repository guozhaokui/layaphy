
/* global performance */
import Vec3 from '../math/Vec3.js';
import GSSolver from '../solver/GSSolver.js';
import Narrowphase from './Narrowphase.js';
import EventTarget from '../utils/EventTarget.js';
import ArrayCollisionMatrix from '../collision/ArrayCollisionMatrix.js';
import OverlapKeeper from '../collision/OverlapKeeper.js';
import Material from '../material/Material.js';
import ContactMaterial from '../material/ContactMaterial.js';
import Body, { BODYTYPE } from '../objects/Body.js';
import TupleDictionary from '../utils/TupleDictionary.js';
import RaycastResult from '../collision/RaycastResult.js';
import Ray from '../collision/Ray.js';
import NaiveBroadphase from '../collision/NaiveBroadphase.js';
import Broadphase from '../collision/Broadphase.js';
import Solver from '../solver/Solver.js';
import ContactEquation from '../equations/ContactEquation.js';
import FrictionEquation from '../equations/FrictionEquation.js';
import Constraint from '../constraints/Constraint.js';
import Shape from '../shapes/Shape.js';
import { PhyRender } from '../layawrap/PhyRender.js';

class profileData{
    frametm:i32=0;     // 帧时间
    broadphase:i32=0;     // 宽阶段碰撞检测的时间
    narrowphase:i32=0;    // 窄阶段碰撞检测的时间
    integrate:i32=0;
    solve:i32=0;     // solve时间
    makeContactConstraints:i32=0;
    error:f32=0;       // 总误差
    avgErr:f32=0;      // 平均每个对象的误差
}    

let perfNow:()=>number;
try{
    perfNow = performance.now;
}catch(e){
    perfNow = Date.now;
}

class PhyEvent{
    type:string;
    body:Body|null;
    constructor(name:string,body:Body|null){
        this.type=name;
        this.body=body;
    }
}

class PhyCollideEvent extends PhyEvent{
    contact:ContactEquation|null;
    constructor(name:string, body:Body|null, c:ContactEquation|null){
        super(name,body);
        this.contact=c;
    }
}
// Temp stuff
var tmpRay = new Ray();

var
    /**
     * Dispatched after the world has stepped forward in time.
     * @event postStep
     */
    World_step_postStepEvent = { type: "postStep" }, // Reusable event objects to save memory
    /**
     * Dispatched before the world steps forward in time.
     * @event preStep
     */
    World_step_preStepEvent:PhyEvent = { type: "preStep" , body:null},
    World_step_collideEvent = new PhyCollideEvent( Body.COLLIDE_EVENT_NAME, null, null ),
    World_step_oldContacts:ContactEquation[] = [], // Pools for unused objects
    World_step_frictionEquationPool:FrictionEquation[] = [],
    World_step_p1:Body[] = [], // Reusable arrays for collision pairs
    World_step_p2:Body[] = [];

var additions:i32[] = [];
var removals:i32[] = [];

interface ContactEvent{
    type:string;
    bodyA:Body|null;
    bodyB:Body|null;
}

interface ShapeContactEvent extends ContactEvent{
    shapeA:Shape|null;
    shapeB:Shape|null;
}
var beginContactEvent:ContactEvent = {
    type: 'beginContact',
    bodyA: null,
    bodyB: null
};
var endContactEvent:ContactEvent = {
    type: 'endContact',
    bodyA: null,
    bodyB: null
};
var beginShapeContactEvent:ShapeContactEvent = {
    type: 'beginShapeContact',
    bodyA: null,
    bodyB: null,
    shapeA: null,
    shapeB: null
};
var endShapeContactEvent:ShapeContactEvent = {
    type: 'endShapeContact',
    bodyA: null,
    bodyB: null,
    shapeA: null,
    shapeB: null
};

export enum PhyColor{
    RED=0xffff0000,GREEN=0xff00ff00,BLUE=0xff0000ff,YELLOW=0xffffff00,PINK=0xffff7777,GRAY=0xff777777,WHITE=0xffffffff,
}

export abstract class IPhyRender{
    abstract stepStart():void;
    abstract stepEnd():void;
    abstract internalStep():void;
    abstract addSeg(stx:f32, sty:f32, stz:f32, dirx:f32, diry:f32, dirz:f32, color:i32):void;
    _addSeg(st:Vec3, dir:Vec3,color:i32):void{
        this.addSeg(st.x,st.y,st.z,dir.x,dir.y,dir.z,color);
    }
    abstract addPoint(px:f32, py:f32, pz:f32, color:i32):void;
    _addPoint(p:Vec3, color:i32):void{
        return this.addPoint(p.x,p.y,p.z,color);
    }
}


/**
 * The physics world
 */
export default class World extends EventTarget {
    /**
     * Currently / last used timestep. Is set to -1 if not available. This value is updated before each internal step, which means that it is "fresh" inside event callbacks.
     */
    dt = -1;
    /**
     * Makes bodies go to sleep when they've been inactive
     */
    allowSleep = true;

    /**
     * All the current contacts (instances of ContactEquation) in the world.
     */
    contacts:ContactEquation[] = [];
    frictionEquations:FrictionEquation[] = [];

    /**
     * How often to normalize quaternions. Set to 0 for every step, 1 for every second etc.. A larger value increases performance. If bodies tend to explode, set to a smaller value (zero to be sure nothing can go wrong).
     */
    quatNormalizeSkip:i32 = 0;

    /**
     * Set to true to use fast quaternion normalization. It is often enough accurate to use. If bodies tend to explode, set to false.
     * @see Quaternion.normalizeFast
     * @see Quaternion.normalize
     */
    quatNormalizeFast = false;

    /**
     * The wall-clock time since simulation start
     * 物理系统累计时间
     */
    time:f32 = 0.0;

    /**
     * Number of timesteps taken since start
     */
    stepnumber:f32 = 0;

    /// Default and last timestep sizes
    default_dt:f32 = 1 / 60;

    nextId:i32 = 0;
    gravity = new Vec3();

    /**
     * The broadphase algorithm to use. Default is NaiveBroadphase
     */
    broadphase: Broadphase = new NaiveBroadphase();

    /**
     * @property bodies
     */
    bodies: Body[] = [];

    /**
     * The solver algorithm to use. Default is GSSolver
     */
    solver:Solver = new GSSolver();

    constraints:Constraint[] = [];

    narrowphase = new Narrowphase(this);

    collisionMatrix = new ArrayCollisionMatrix();

    /**
     * CollisionMatrix from the previous step.
     */
    collisionMatrixPrevious = new ArrayCollisionMatrix();

    bodyOverlapKeeper = new OverlapKeeper();
    shapeOverlapKeeper = new OverlapKeeper();

    /**
     * All added materials
     */
    materials:Material[] = [];

    /**
     * 接触材质，发生碰撞后，根据a，b的材质，到这里找对应的接触材质
     */
    contactmaterials:ContactMaterial[] = [];

    /**
     * Used to look up a ContactMaterial given two instances of Material.
     */
    contactMaterialTable = new TupleDictionary<ContactMaterial>();

    defaultMaterial = new Material("default");

    /**
     * This contact material is used if no suitable contactmaterial is found for a contact.
     * 缺省材质
     */
    defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial,  0.3, 0.0);

    doProfiling = false;

    profile = new profileData();

    /**
     * Time accumulator for interpolation. See http://gafferongames.com/game-physics/fix-your-timestep/
     */
    accumulator:f32 = 0;    //秒

    subsystems:{update:()=>void}[] = [];

    /**
     * Dispatched after a body has been added to the world.
     */
    addBodyEvent = new PhyEvent("addBody",null);

    /**
     * Dispatched after a body has been removed from the world.
     * @param  body The body that has been removed from the world.
     */
    removeBodyEvent = new PhyEvent('removeBody', null); 

    idToBodyMap:{[id:string]:Body} = {};

    _phyRender:IPhyRender;

    constructor(options?:any) {
        super();
        options = options || {};
        this.allowSleep = !!options.allowSleep;
        this.quatNormalizeSkip = options.quatNormalizeSkip !== undefined ? options.quatNormalizeSkip : 0;
        this.quatNormalizeFast = options.quatNormalizeFast !== undefined ? options.quatNormalizeFast : false;

        if (options.gravity) {
            this.gravity.copy(options.gravity);
        }
        this.broadphase = options.broadphase !== undefined ? options.broadphase : new NaiveBroadphase();
        this.solver = options.solver !== undefined ? options.solver : new GSSolver();
        this.broadphase.setWorld(this);
    }

    set phyRender(r:IPhyRender){
        this._phyRender=r;
        (this.solver as GSSolver)._phyr=r as PhyRender;
    }
    get phyRender(){
        return this._phyRender;
    }
    /**
     * 接触事件
     */
    emitContactEvents() {
        var hasBeginContact = this.hasAnyEventListener('beginContact');
        var hasEndContact = this.hasAnyEventListener('endContact');

        if (hasBeginContact || hasEndContact) {
            this.bodyOverlapKeeper.getDiff(additions, removals);
        }

        if (hasBeginContact) {
            for (var i = 0, l = additions.length; i < l; i += 2) {
                beginContactEvent.bodyA = this.getBodyById(additions[i]);
                beginContactEvent.bodyB = this.getBodyById(additions[i + 1]);
                this.dispatchEvent(beginContactEvent);
            }
            beginContactEvent.bodyA = beginContactEvent.bodyB = null;
        }

        if (hasEndContact) {
            for (var i = 0, l = removals.length; i < l; i += 2) {
                endContactEvent.bodyA = this.getBodyById(removals[i]);
                endContactEvent.bodyB = this.getBodyById(removals[i + 1]);
                this.dispatchEvent(endContactEvent);
            }
            endContactEvent.bodyA = endContactEvent.bodyB = null;
        }

        additions.length = removals.length = 0;

        var hasBeginShapeContact = this.hasAnyEventListener('beginShapeContact');
        var hasEndShapeContact = this.hasAnyEventListener('endShapeContact');

        if (hasBeginShapeContact || hasEndShapeContact) {
            this.shapeOverlapKeeper.getDiff(additions, removals);
        }

        if (hasBeginShapeContact) {
            for (var i = 0, l = additions.length; i < l; i += 2) {
                var shapeA = this.getShapeById(additions[i]);
                var shapeB = this.getShapeById(additions[i + 1]);
                beginShapeContactEvent.shapeA = shapeA;
                beginShapeContactEvent.shapeB = shapeB;
                beginShapeContactEvent.bodyA = shapeA && shapeA.body;
                beginShapeContactEvent.bodyB = shapeB && shapeB.body;
                this.dispatchEvent(beginShapeContactEvent);
            }
            beginShapeContactEvent.bodyA = beginShapeContactEvent.bodyB = beginShapeContactEvent.shapeA = beginShapeContactEvent.shapeB = null;
        }

        if (hasEndShapeContact) {
            for (var i = 0, l = removals.length; i < l; i += 2) {
                var shapeA = this.getShapeById(removals[i]);
                var shapeB = this.getShapeById(removals[i + 1]);
                endShapeContactEvent.shapeA = shapeA;
                endShapeContactEvent.shapeB = shapeB;
                endShapeContactEvent.bodyA = shapeA && shapeA.body;
                endShapeContactEvent.bodyB = shapeB && shapeB.body;
                this.dispatchEvent(endShapeContactEvent);
            }
            endShapeContactEvent.bodyA = endShapeContactEvent.bodyB = endShapeContactEvent.shapeA = endShapeContactEvent.shapeB = null;
        }

    }


    /**
     * Sets all body forces in the world to zero.
     */
    clearForces() {
        var bodies = this.bodies;
        var N = bodies.length;
        for (var i = 0; i !== N; i++) {
            var b = bodies[i],
                force = b.force,
                tau = b.torque;

            force.set(0, 0, 0);
            tau.set(0, 0, 0);
        }
    }


    /**
     * Get the contact material between materials m1 and m2
     * @return The contact material if it was found.
     */
    getContactMaterial(m1:Material, m2:Material) {
        return this.contactMaterialTable.get(m1.id, m2.id); //this.contactmaterials[this.mats2cmat[i+j*this.materials.length]];
    }

    /**
     * Get number of objects in the world.
     * @deprecated
     */
    numObjects() {
        return this.bodies.length;
    }

    /**
     * Store old collision state info
     * @method collisionMatrixTick
     */
    collisionMatrixTick() {
        var temp = this.collisionMatrixPrevious;
        this.collisionMatrixPrevious = this.collisionMatrix;
        this.collisionMatrix = temp;
        this.collisionMatrix.reset();

        this.bodyOverlapKeeper.tick();
        this.shapeOverlapKeeper.tick();
    }

    /**
     * Add a rigid body to the simulation.
     * @todo If the simulation has not yet started, why recrete and copy arrays for each body? Accumulate in dynamic arrays in this case.
     * @todo Adding an array of bodies should be possible. This would save some loops too
     * @deprecated Use .addBody instead
     */
    addBody(body:Body) {
        if (this.bodies.indexOf(body) !== -1) {
            return;
        }
        body.index = this.bodies.length;
        this.bodies.push(body);
        body.world = this;
        body.initPosition.copy(body.position);
        body.initVelocity.copy(body.velocity);
        body.timeLastSleepy = this.time;
        if (body instanceof Body) {
            body.initAngularVelocity.copy(body.angularVelocity);
            body.initQuaternion.copy(body.quaternion);
        }
        this.collisionMatrix.setNumObjects(this.bodies.length);
        this.addBodyEvent.body = body;
        this.idToBodyMap[body.id] = body;
        this.dispatchEvent(this.addBodyEvent);
    }

    /**
     * Add a constraint to the simulation.
     */
    addConstraint(c:Constraint) {
        this.constraints.push(c);
    }

    /**
     * Removes a constraint
     */
    removeConstraint(c:Constraint) {
        var idx = this.constraints.indexOf(c);
        if (idx !== -1) {
            this.constraints.splice(idx, 1);
        }
    }

    /**
     * Raycast test
     * @deprecated Use .raycastAll, .raycastClosest or .raycastAny instead.
     */
    rayTest(from:Vec3, to:Vec3, result:RaycastResult) {
        if (result instanceof RaycastResult) {
            // Do raycastclosest
            this.raycastClosest(from, to, {
                skipBackfaces: true
            }, result);
        } else {
            // Do raycastAll
            this.raycastAll(from, to, {
                skipBackfaces: true
            }, result);
        }
    }

    /**
     * Ray cast against all bodies. The provided callback will be executed for each hit with a RaycastResult as single argument.
     * @method raycastAll
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {Function} callback
     * @return  True if any body was hit.
     */
    raycastAll(from:Vec3, to:Vec3, options:any, callback:(result:RaycastResult)=>void) :boolean{
        options.mode = Ray.ALL;
        options.from = from;
        options.to = to;
        options.callback = callback;
        return tmpRay.intersectWorld(this, options);
    }

    /**
     * Ray cast, and stop at the first result. Note that the order is random - but the method is fast.
     * @method raycastAny
     * @param  {Vec3} from
     * @param  {Vec3} to
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {RaycastResult} result
     * @return {boolean} True if any body was hit.
     */
    raycastAny(from:Vec3, to:Vec3, options:any, result:RaycastResult):boolean {
        options.mode = Ray.ANY;
        options.from = from;
        options.to = to;
        options.result = result;
        return tmpRay.intersectWorld(this, options);
    }

    /**
     * Ray cast, and return information of the closest hit.
     * @method raycastClosest
     * @param  {Vec3} from
     * @param  {Vec3} to
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {RaycastResult} result
     * @return  True if any body was hit.
     */
    raycastClosest(from:Vec3, to:Vec3, options:any, result:RaycastResult) {
        options.mode = Ray.CLOSEST;
        options.from = from;
        options.to = to;
        options.result = result;
        return tmpRay.intersectWorld(this, options);
    }

    /**
     * Remove a rigid body from the simulation.
     * @method remove
     * @param {Body} body
     * @deprecated Use .removeBody instead
     */
    remove(body: Body) {
        body.world = null;
        var n = this.bodies.length - 1,
            bodies = this.bodies,
            idx = bodies.indexOf(body);
        if (idx !== -1) {
            bodies.splice(idx, 1); // Todo: should use a garbage free method

            // Recompute index
            for (var i = 0; i !== bodies.length; i++) {
                bodies[i].index = i;
            }

            this.collisionMatrix.setNumObjects(n);
            this.removeBodyEvent.body = body;
            delete this.idToBodyMap[body.id];
            this.dispatchEvent(this.removeBodyEvent);
        }
    }

    /**
     * Remove a rigid body from the simulation.
     */
    //World.prototype.removeBody = World.prototype.remove;

    getBodyById(id:number) {
        return this.idToBodyMap[id];
    }

    // TODO Make a faster map
    getShapeById(id:i32):Shape|null {
        var bodies = this.bodies;
        for (var i = 0, bl = bodies.length; i < bl; i++) {
            var shapes = bodies[i].shapes;
            for (var j = 0, sl = shapes.length; j < sl; j++) {
                var shape = shapes[j];
                if (shape.id === id) {
                    return shape;
                }
            }
        }
        return null;
    }

    /**
     * Adds a material to the World.
     * @todo Necessary?
     */
    addMaterial(m:Material) {
        this.materials.push(m);
    }

    /**
     * Adds a contact material to the World
     * @method addContactMaterial
     * @param  cmat
     */
    addContactMaterial(cmat:ContactMaterial):World {
        // Add contact material
        this.contactmaterials.push(cmat);
        // Add current contact material to the material table
        this.contactMaterialTable.set(cmat.materials[0].id, cmat.materials[1].id, cmat);
        return this;
    }


    /**
     * Step the physics world forward in time.
     *
     * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. 
     * The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
     *
     * @param dt                       The fixed time step size to use. 单位是秒
     * @param [timeSinceLastCalled]    The time elapsed since the function was last called. 如果为0则直接使用dt来计算，表示固定时间间隔
     * @param [maxSubSteps=10]         Maximum number of fixed steps to take per function call. 最大插值次数
     *
     * @example
     *     // fixed timestepping without interpolation
     *     world.step(1/60);
     */
    step(dt: number, timeSinceLastCalled: number = 0, maxSubSteps: number = 10) {
        if(this.phyRender){
            this.phyRender.stepStart();
        }
        if (timeSinceLastCalled === 0) { // Fixed, simple stepping
            this.internalStep(dt);
            // Increment time
            this.time += dt;
        } else {
            this.accumulator += timeSinceLastCalled;   // 上次可能还有一部分时间没有处理，所以是 +=
            var substeps = 0;
            while (this.accumulator >= dt && substeps < maxSubSteps) {
                // Do fixed steps to catch up
                this.internalStep(dt);
                this.accumulator -= dt;
                substeps++;
            }

            // accumulator可能还剩一些
            /*
            var t = (this.accumulator % dt) / dt;
            for (var j = 0; j !== this.bodies.length; j++) {
                var b = this.bodies[j];
                b.previousPosition.lerp(b.position, t, b.interpolatedPosition); //  这个目前没有用上。
                b.previousQuaternion.slerp(b.quaternion, t, b.interpolatedQuaternion);
                b.previousQuaternion.normalize();
            }
            */
            this.time += timeSinceLastCalled;
        }
        if(this.phyRender){
            this.phyRender.stepEnd();
        }
    }

    internalStep(dt:number) {
        this.dt = dt;

        var contacts = this.contacts,
            p1 = World_step_p1,
            p2 = World_step_p2,
            N = this.numObjects(),
            bodies = this.bodies,
            solver = this.solver,
            gravity = this.gravity,
            doProfiling = this.doProfiling,
            profile = this.profile,
            DYNAMIC = BODYTYPE.DYNAMIC,
            profilingStart:f32=0,
            constraints = this.constraints,
            frictionEquationPool = World_step_frictionEquationPool,
            //gnorm:f32 = gravity.length(),
            gx:f32 = gravity.x,
            gy:f32 = gravity.y,
            gz:f32 = gravity.z,
            i:i32 = 0;

        if (doProfiling) {
            profilingStart = perfNow();
        }

        // Add gravity to all objects
        for (i = 0; i !== N; i++) {
            var bi = bodies[i];
			if (bi.type === DYNAMIC && bi.enable) { // Only for dynamic bodies
				//temp
				if(bi.onStep){
					bi.onStep();
				}
				//temp
                var f = bi.force, m = bi._mass;
                f.x += m * gx;
                f.y += m * gy;
                f.z += m * gz;
            }
        }

        // Update subsystems
        for (var i = 0, Nsubsystems = this.subsystems.length; i !== Nsubsystems; i++) {
            this.subsystems[i].update();
        }

        // Collision detection
        if (doProfiling) { profilingStart = perfNow(); }
        p1.length = 0; // Clean up pair arrays from last step
        p2.length = 0;
        this.broadphase.collisionPairs(this, p1, p2);
        if (doProfiling) { profile.broadphase = perfNow() - profilingStart; }   // 宽阶段的时间

        // Remove constrained pairs with collideConnected == false
        var Nconstraints = constraints.length;
        for (i = 0; i !== Nconstraints; i++) {
            let c = constraints[i];
            if (!c.collideConnected) {
                for (var j = p1.length - 1; j >= 0; j -= 1) {
                    if ((c.bodyA === p1[j] && c.bodyB === p2[j]) ||
                        (c.bodyB === p1[j] && c.bodyA === p2[j])) {
                        p1.splice(j, 1);
                        p2.splice(j, 1);
                    }
                }
            }
        }

        this.collisionMatrixTick();

        // Generate contacts
        if (doProfiling) { profilingStart = perfNow(); }
        var oldcontacts = World_step_oldContacts;
        var NoldContacts = contacts.length;

        for (i = 0; i !== NoldContacts; i++) {
            oldcontacts.push(contacts[i]);
        }
        contacts.length = 0;

        // Transfer FrictionEquation from current list to the pool for reuse
        var NoldFrictionEquations = this.frictionEquations.length;
        for (i = 0; i !== NoldFrictionEquations; i++) {
            frictionEquationPool.push(this.frictionEquations[i]);
        }
        this.frictionEquations.length = 0;

        this.narrowphase.getContacts(p1,p2,this,contacts,
            oldcontacts, // To be reused
            this.frictionEquations,
            frictionEquationPool
        );

        if (doProfiling) {
            profile.narrowphase = perfNow() - profilingStart;  // 窄阶段的时间
        }

        // Loop over all collisions
        if (doProfiling) {
            profilingStart = perfNow();
        }

        // Add all friction eqs
        for (var i = 0; i < this.frictionEquations.length; i++) {
            solver.addEquation(this.frictionEquations[i]);
        }

        var ncontacts = contacts.length;
        for (var k = 0; k !== ncontacts; k++) {

            // Current contact
            let c = contacts[k];

            // Get current collision indeces
            let bi = c.bi,
                bj = c.bj,
                si = c.si,
                sj = c.sj;

            // Get collision properties
            var cm:ContactMaterial;
            if (bi.material && bj.material) {
                cm = this.getContactMaterial(bi.material, bj.material) || this.defaultContactMaterial;
            } else {
                cm = this.defaultContactMaterial;
            }

            // c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

            var mu = cm.friction;
            // c.restitution = cm.restitution;

            // If friction or restitution were specified in the material, use them
            if (bi.material && bj.material) {
                if (bi.material.friction >= 0 && bj.material.friction >= 0) {
                    mu = bi.material.friction * bj.material.friction;
                }

                if (bi.material.restitution >= 0 && bj.material.restitution >= 0) {
                    c.restitution = bi.material.restitution * bj.material.restitution;
                }
            }

            // c.setSpookParams(
            //           cm.contactEquationStiffness,
            //           cm.contactEquationRelaxation,
            //           dt
            //       );

            solver.addEquation(c);

            if(mu>0){}
            // // Add friction constraint equation
            // if(mu > 0){

            // 	// Create 2 tangent equations
            // 	var mug = mu * gnorm;
            // 	var reducedMass = (bi.invMass + bj.invMass);
            // 	if(reducedMass > 0){
            // 		reducedMass = 1/reducedMass;
            // 	}
            // 	var pool = frictionEquationPool;
            // 	var c1 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
            // 	var c2 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
            // 	this.frictionEquations.push(c1, c2);

            // 	c1.bi = c2.bi = bi;
            // 	c1.bj = c2.bj = bj;
            // 	c1.minForce = c2.minForce = -mug*reducedMass;
            // 	c1.maxForce = c2.maxForce = mug*reducedMass;

            // 	// Copy over the relative vectors
            // 	c1.ri.copy(c.ri);
            // 	c1.rj.copy(c.rj);
            // 	c2.ri.copy(c.ri);
            // 	c2.rj.copy(c.rj);

            // 	// Construct tangents
            // 	c.ni.tangents(c1.t, c2.t);

            //           // Set spook params
            //           c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);
            //           c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);

            //           c1.enabled = c2.enabled = c.enabled;

            // 	// Add equations to solver
            // 	solver.addEquation(c1);
            // 	solver.addEquation(c2);
            // }

            if (bi.allowSleep &&
                bi.type === BODYTYPE.DYNAMIC &&
                bi.sleepState === Body.SLEEPING &&
                bj.sleepState === Body.AWAKE &&
                bj.type !== BODYTYPE.STATIC
            ) {
                var speedSquaredB = bj.velocity.lengthSquared() + bj.angularVelocity.lengthSquared();
                var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2);
                if (speedSquaredB >= speedLimitSquaredB * 2) {
                    bi._wakeUpAfterNarrowphase = true;
                }
            }

            if (bj.allowSleep &&
                bj.type === BODYTYPE.DYNAMIC &&
                bj.sleepState === Body.SLEEPING &&
                bi.sleepState === Body.AWAKE &&
                bi.type !== BODYTYPE.STATIC
            ) {
                var speedSquaredA = bi.velocity.lengthSquared() + bi.angularVelocity.lengthSquared();
                var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2);
                if (speedSquaredA >= speedLimitSquaredA * 2) {
                    bj._wakeUpAfterNarrowphase = true;
                }
            }

            // Now we know that i and j are in contact. Set collision matrix state
            this.collisionMatrix.set(bi, bj, true);

            if (!this.collisionMatrixPrevious.get(bi, bj)) {
                // First contact!
                // We reuse the collideEvent object, otherwise we will end up creating new objects for each new contact, even if there's no event listener attached.
                World_step_collideEvent.body = bj;
                World_step_collideEvent.contact = c;
                bi.dispatchEvent(World_step_collideEvent);

                World_step_collideEvent.body = bi;
                bj.dispatchEvent(World_step_collideEvent);
            }

            this.bodyOverlapKeeper.set(bi.id, bj.id);
            this.shapeOverlapKeeper.set(si.id, sj.id);
        }

        this.emitContactEvents();

        if (doProfiling) {
            profile.makeContactConstraints = perfNow() - profilingStart;
            profilingStart = perfNow();
        }

        // Wake up bodies
        for (i = 0; i !== N; i++) {
            var bi = bodies[i];
            if (bi._wakeUpAfterNarrowphase) {
                bi.wakeUp();
                bi._wakeUpAfterNarrowphase = false;
            }
        }

        // Add user-added constraints
        var Nconstraints = constraints.length;
        for (i = 0; i !== Nconstraints; i++) {
            var c = constraints[i];
            c.update();
            for (var j = 0, Neq = c.equations.length; j !== Neq; j++) {
                var eq = c.equations[j];
                solver.addEquation(eq);
            }
        }

        // Solve the constrained system
        solver.solve(dt, this);

        if (doProfiling) {
            profile.solve = perfNow() - profilingStart;     // solve的时间
        }

        // Remove all contacts from solver
        solver.removeAllEquations();

        // Apply damping, see http://code.google.com/p/bullet/issues/detail?id=74 for details
        var pow = Math.pow;
        for (i = 0; i !== N; i++) {
            var bi = bodies[i];
            if (bi.type & DYNAMIC) { // Only for dynamic bodies
                var ld = pow(1.0 - bi.linearDamping, dt);
                var v = bi.velocity;
                v.scale(ld, v);
                var av = bi.angularVelocity;
                if (av) {
                    var ad = pow(1.0 - bi.angularDamping, dt);
                    av.scale(ad, av);
                }
            }
        }

        this.dispatchEvent(World_step_preStepEvent);

        // Invoke pre-step callbacks
        for (i = 0; i !== N; i++) {
            var bi = bodies[i];
            if (bi.preStep) {
                bi.preStep.call(bi);
            }
        }

        // Leap frog
        // vnew = v + h*f/m
        // xnew = x + h*vnew
        if (doProfiling) {
            profilingStart = perfNow();
        }
        var stepnumber = this.stepnumber;
        var quatNormalize = stepnumber % (this.quatNormalizeSkip + 1) === 0;
        var quatNormalizeFast = this.quatNormalizeFast;

        for (i = 0; i !== N; i++) {
            bodies[i].integrate(dt, quatNormalize, quatNormalizeFast);
        }
        this.clearForces();

        this.broadphase.dirty = true;

        if (doProfiling) {
            profile.integrate = perfNow() - profilingStart;
        }

        // Update world time
        this.time += dt;
        this.stepnumber += 1;

        this.dispatchEvent(World_step_postStepEvent);

        // Invoke post-step callbacks
        for (i = 0; i !== N; i++) {
            var bi = bodies[i];
            var postStep = bi.postStep;
            if (postStep) {
                postStep.call(bi);
            }
        }

        // Sleeping update
        if (this.allowSleep) {
            for (i = 0; i !== N; i++) {
                bodies[i].sleepTick(this.time);
            }
        }

        if(this.phyRender){
            this.phyRender.internalStep();
        }
    }

}


