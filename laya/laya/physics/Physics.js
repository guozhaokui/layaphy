import { RigidBody } from "./RigidBody";
import { Laya } from "../../Laya";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Point } from "../maths/Point";
import { ClassUtils } from "../utils/ClassUtils";
import { IPhysics } from "./IPhysics";
export class Physics extends EventDispatcher {
    constructor() {
        super();
        this.box2d = window.box2d;
        this.velocityIterations = 8;
        this.positionIterations = 3;
        this._eventList = [];
    }
    static get I() {
        return Physics._I || (Physics._I = new Physics());
    }
    static enable(options = null) {
        Physics.I.start(options);
        IPhysics.RigidBody = RigidBody;
        IPhysics.Physics = this;
    }
    start(options = null) {
        if (!this._enabled) {
            this._enabled = true;
            options || (options = {});
            var box2d = window.box2d;
            if (box2d == null) {
                console.error("Can not find box2d libs, you should reuqest box2d.js first.");
                return;
            }
            var gravity = new box2d.b2Vec2(0, options.gravity || 500 / Physics.PIXEL_RATIO);
            this.world = new box2d.b2World(gravity);
            this.world.SetContactListener(new ContactListener());
            this.allowSleeping = options.allowSleeping == null ? true : options.allowSleeping;
            if (!options.customUpdate)
                Laya.physicsTimer.frameLoop(1, this, this._update);
            this._emptyBody = this._createBody(new window.box2d.b2BodyDef());
        }
    }
    _update() {
        this.world.Step(1 / 60, this.velocityIterations, this.positionIterations, 3);
        var len = this._eventList.length;
        if (len > 0) {
            for (var i = 0; i < len; i += 2) {
                this._sendEvent(this._eventList[i], this._eventList[i + 1]);
            }
            this._eventList.length = 0;
        }
    }
    _sendEvent(type, contact) {
        var colliderA = contact.GetFixtureA().collider;
        var colliderB = contact.GetFixtureB().collider;
        var ownerA = colliderA.owner;
        var ownerB = colliderB.owner;
        contact.getHitInfo = function () {
            var manifold = new this.box2d.b2WorldManifold();
            this.GetWorldManifold(manifold);
            var p = manifold.points[0];
            p.x *= Physics.PIXEL_RATIO;
            p.y *= Physics.PIXEL_RATIO;
            return manifold;
        };
        if (ownerA) {
            var args = [colliderB, colliderA, contact];
            if (type === 0) {
                ownerA.event(Event.TRIGGER_ENTER, args);
                if (!ownerA["_triggered"]) {
                    ownerA["_triggered"] = true;
                }
                else {
                    ownerA.event(Event.TRIGGER_STAY, args);
                }
            }
            else {
                ownerA["_triggered"] = false;
                ownerA.event(Event.TRIGGER_EXIT, args);
            }
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            if (type === 0) {
                ownerB.event(Event.TRIGGER_ENTER, args);
                if (!ownerB["_triggered"]) {
                    ownerB["_triggered"] = true;
                }
                else {
                    ownerB.event(Event.TRIGGER_STAY, args);
                }
            }
            else {
                ownerB["_triggered"] = false;
                ownerB.event(Event.TRIGGER_EXIT, args);
            }
        }
    }
    _createBody(def) {
        if (this.world) {
            return this.world.CreateBody(def);
        }
        else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }
    _removeBody(body) {
        if (this.world) {
            this.world.DestroyBody(body);
        }
        else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }
    _createJoint(def) {
        if (this.world) {
            return this.world.CreateJoint(def);
        }
        else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }
    _removeJoint(joint) {
        if (this.world) {
            this.world.DestroyJoint(joint);
        }
        else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }
    stop() {
        Laya.physicsTimer.clear(this, this._update);
    }
    get allowSleeping() {
        return this.world.GetAllowSleeping();
    }
    set allowSleeping(value) {
        this.world.SetAllowSleeping(value);
    }
    get gravity() {
        return this.world.GetGravity();
    }
    set gravity(value) {
        this.world.SetGravity(value);
    }
    getBodyCount() {
        return this.world.GetBodyCount();
    }
    getContactCount() {
        return this.world.GetContactCount();
    }
    getJointCount() {
        return this.world.GetJointCount();
    }
    get worldRoot() {
        return this._worldRoot || Laya.stage;
    }
    set worldRoot(value) {
        this._worldRoot = value;
        if (value) {
            var p = value.localToGlobal(Point.TEMP.setTo(0, 0));
            this.world.ShiftOrigin({ x: p.x / Physics.PIXEL_RATIO, y: p.y / Physics.PIXEL_RATIO });
        }
    }
}
Physics.PIXEL_RATIO = 50;
ClassUtils.regClass("laya.physics.Physics", Physics);
ClassUtils.regClass("Laya.Physics", Physics);
class ContactListener {
    BeginContact(contact) {
        Physics.I._eventList.push(0, contact);
    }
    EndContact(contact) {
        Physics.I._eventList.push(1, contact);
    }
    PreSolve(contact, oldManifold) {
    }
    PostSolve(contact, impulse) {
    }
}
