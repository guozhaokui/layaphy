import { Stat } from "../../utils/Stat";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { PhysicsUpdateList } from "./PhysicsUpdateList";
import { CollisionTool } from "./CollisionTool";
import { PhysicsComponent } from "./PhysicsComponent";
import { Physics3D } from "./Physics3D";
export class PhysicsSimulation {
    constructor(configuration, flags = 0) {
        this._gravity = new Vector3(0, -10, 0);
        this._nativeVector3Zero = new Physics3D._physics3D.btVector3(0, 0, 0);
        this._nativeDefaultQuaternion = new Physics3D._physics3D.btQuaternion(0, 0, 0, -1);
        this._collisionsUtils = new CollisionTool();
        this._previousFrameCollisions = [];
        this._currentFrameCollisions = [];
        this._physicsUpdateList = new PhysicsUpdateList();
        this._characters = [];
        this._updatedRigidbodies = 0;
        this.maxSubSteps = 1;
        this.fixedTimeStep = 1.0 / 60.0;
        this.maxSubSteps = configuration.maxSubSteps;
        this.fixedTimeStep = configuration.fixedTimeStep;
        var physics3D = Physics3D._physics3D;
        this._nativeCollisionConfiguration = new physics3D.btDefaultCollisionConfiguration();
        this._nativeDispatcher = new physics3D.btCollisionDispatcher(this._nativeCollisionConfiguration);
        this._nativeBroadphase = new physics3D.btDbvtBroadphase();
        this._nativeBroadphase.getOverlappingPairCache().setInternalGhostPairCallback(new physics3D.btGhostPairCallback());
        var conFlags = configuration.flags;
        if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
            this._nativeCollisionWorld = new physics3D.btCollisionWorld(this._nativeDispatcher, this._nativeBroadphase, this._nativeCollisionConfiguration);
        }
        else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
            throw "PhysicsSimulation:SoftBody processing is not yet available";
        }
        else {
            var solver = new physics3D.btSequentialImpulseConstraintSolver();
            this._nativeDiscreteDynamicsWorld = new physics3D.btDiscreteDynamicsWorld(this._nativeDispatcher, this._nativeBroadphase, solver, this._nativeCollisionConfiguration);
            this._nativeCollisionWorld = this._nativeDiscreteDynamicsWorld;
        }
        if (this._nativeDiscreteDynamicsWorld) {
            this._nativeSolverInfo = this._nativeDiscreteDynamicsWorld.getSolverInfo();
            this._nativeDispatchInfo = this._nativeDiscreteDynamicsWorld.getDispatchInfo();
        }
        this._nativeClosestRayResultCallback = new physics3D.ClosestRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeAllHitsRayResultCallback = new physics3D.AllHitsRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeClosestConvexResultCallback = new physics3D.ClosestConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeAllConvexResultCallback = new physics3D.AllConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        physics3D._btGImpactCollisionAlgorithm_RegisterAlgorithm(this._nativeDispatcher.a);
    }
    static __init__() {
        PhysicsSimulation._nativeTempVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        PhysicsSimulation._nativeTempVector31 = new Physics3D._physics3D.btVector3(0, 0, 0);
        PhysicsSimulation._nativeTempQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        PhysicsSimulation._nativeTempQuaternion1 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        PhysicsSimulation._nativeTempTransform0 = new Physics3D._physics3D.btTransform();
        PhysicsSimulation._nativeTempTransform1 = new Physics3D._physics3D.btTransform();
    }
    static createConstraint() {
    }
    get continuousCollisionDetection() {
        return this._nativeDispatchInfo.get_m_useContinuous();
    }
    set continuousCollisionDetection(value) {
        this._nativeDispatchInfo.set_m_useContinuous(value);
    }
    get gravity() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._gravity;
    }
    set gravity(value) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._gravity = value;
        var nativeGravity = PhysicsSimulation._nativeTempVector30;
        nativeGravity.setValue(-value.x, value.y, value.z);
        this._nativeDiscreteDynamicsWorld.setGravity(nativeGravity);
    }
    get speculativeContactRestitution() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._nativeDiscreteDynamicsWorld.getApplySpeculativeContactRestitution();
    }
    set speculativeContactRestitution(value) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.setApplySpeculativeContactRestitution(value);
    }
    _simulate(deltaTime) {
        this._updatedRigidbodies = 0;
        if (this._nativeDiscreteDynamicsWorld)
            this._nativeDiscreteDynamicsWorld.stepSimulation(deltaTime, this.maxSubSteps, this.fixedTimeStep);
        else
            this._nativeCollisionWorld.PerformDiscreteCollisionDetection();
    }
    _destroy() {
        var physics3D = Physics3D._physics3D;
        if (this._nativeDiscreteDynamicsWorld) {
            physics3D.destroy(this._nativeDiscreteDynamicsWorld);
            this._nativeDiscreteDynamicsWorld = null;
        }
        else {
            physics3D.destroy(this._nativeCollisionWorld);
            this._nativeCollisionWorld = null;
        }
        physics3D.destroy(this._nativeBroadphase);
        this._nativeBroadphase = null;
        physics3D.destroy(this._nativeDispatcher);
        this._nativeDispatcher = null;
        physics3D.destroy(this._nativeCollisionConfiguration);
        this._nativeCollisionConfiguration = null;
    }
    _addPhysicsCollider(component, group, mask) {
        this._nativeCollisionWorld.addCollisionObject(component._nativeColliderObject, group, mask);
    }
    _removePhysicsCollider(component) {
        this._nativeCollisionWorld.removeCollisionObject(component._nativeColliderObject);
    }
    _addRigidBody(rigidBody, group, mask) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.addRigidBody(rigidBody._nativeColliderObject, group, mask);
    }
    _removeRigidBody(rigidBody) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.removeRigidBody(rigidBody._nativeColliderObject);
    }
    _addCharacter(character, group, mask) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.addCollisionObject(character._nativeColliderObject, group, mask);
        this._nativeCollisionWorld.addAction(character._nativeKinematicCharacter);
    }
    _removeCharacter(character) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.removeCollisionObject(character._nativeColliderObject);
        this._nativeCollisionWorld.removeAction(character._nativeKinematicCharacter);
    }
    raycastFromTo(from, to, out = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var rayResultCall = this._nativeClosestRayResultCallback;
        var rayFrom = PhysicsSimulation._nativeTempVector30;
        var rayTo = PhysicsSimulation._nativeTempVector31;
        rayFrom.setValue(-from.x, from.y, from.z);
        rayTo.setValue(-to.x, to.y, to.z);
        rayResultCall.set_m_rayFromWorld(rayFrom);
        rayResultCall.set_m_rayToWorld(rayTo);
        rayResultCall.set_m_collisionFilterGroup(collisonGroup);
        rayResultCall.set_m_collisionFilterMask(collisionMask);
        rayResultCall.set_m_collisionObject(null);
        rayResultCall.set_m_closestHitFraction(1);
        this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall);
        if (rayResultCall.hasHit()) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[rayResultCall.get_m_collisionObject().getUserIndex()];
                out.hitFraction = rayResultCall.get_m_closestHitFraction();
                var nativePoint = rayResultCall.get_m_hitPointWorld();
                var point = out.point;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                var nativeNormal = rayResultCall.get_m_hitNormalWorld();
                var normal = out.normal;
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            if (out)
                out.succeeded = false;
            return false;
        }
    }
    raycastAllFromTo(from, to, out, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var rayResultCall = this._nativeAllHitsRayResultCallback;
        var rayFrom = PhysicsSimulation._nativeTempVector30;
        var rayTo = PhysicsSimulation._nativeTempVector31;
        out.length = 0;
        rayFrom.setValue(-from.x, from.y, from.z);
        rayTo.setValue(-to.x, to.y, to.z);
        rayResultCall.set_m_rayFromWorld(rayFrom);
        rayResultCall.set_m_rayToWorld(rayTo);
        rayResultCall.set_m_collisionFilterGroup(collisonGroup);
        rayResultCall.set_m_collisionFilterMask(collisionMask);
        var collisionObjects = rayResultCall.get_m_collisionObjects();
        var nativePoints = rayResultCall.get_m_hitPointWorld();
        var nativeNormals = rayResultCall.get_m_hitNormalWorld();
        var nativeFractions = rayResultCall.get_m_hitFractions();
        collisionObjects.clear();
        nativePoints.clear();
        nativeNormals.clear();
        nativeFractions.clear();
        this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall);
        var count = collisionObjects.size();
        if (count > 0) {
            this._collisionsUtils.recoverAllHitResultsPool();
            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
                hitResult.hitFraction = nativeFractions.at(i);
                var nativePoint = nativePoints.at(i);
                var pointE = hitResult.point;
                pointE.x = -nativePoint.x();
                pointE.y = nativePoint.y();
                pointE.z = nativePoint.z();
                var nativeNormal = nativeNormals.at(i);
                var normalE = hitResult.normal;
                normalE.x = -nativeNormal.x();
                normalE.y = nativeNormal.y();
                normalE.z = nativeNormal.z();
            }
            return true;
        }
        else {
            return false;
        }
    }
    rayCast(ray, outHitResult = null, distance = 2147483647, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        return this.raycastFromTo(from, to, outHitResult, collisonGroup, collisionMask);
    }
    rayCastAll(ray, out, distance = 2147483647, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
    }
    shapeCast(shape, fromPosition, toPosition, out = null, fromRotation = null, toRotation = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
        var convexResultCall = this._nativeClosestConvexResultCallback;
        var convexPosFrom = PhysicsSimulation._nativeTempVector30;
        var convexPosTo = PhysicsSimulation._nativeTempVector31;
        var convexRotFrom = PhysicsSimulation._nativeTempQuaternion0;
        var convexRotTo = PhysicsSimulation._nativeTempQuaternion1;
        var convexTransform = PhysicsSimulation._nativeTempTransform0;
        var convexTransTo = PhysicsSimulation._nativeTempTransform1;
        var sweepShape = shape._nativeShape;
        convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
        convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);
        convexResultCall.set_m_collisionFilterGroup(collisonGroup);
        convexResultCall.set_m_collisionFilterMask(collisionMask);
        convexTransform.setOrigin(convexPosFrom);
        convexTransTo.setOrigin(convexPosTo);
        if (fromRotation) {
            convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            convexTransform.setRotation(convexRotFrom);
        }
        else {
            convexTransform.setRotation(this._nativeDefaultQuaternion);
        }
        if (toRotation) {
            convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
            convexTransTo.setRotation(convexRotTo);
        }
        else {
            convexTransTo.setRotation(this._nativeDefaultQuaternion);
        }
        convexResultCall.set_m_hitCollisionObject(null);
        convexResultCall.set_m_closestHitFraction(1);
        this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        if (convexResultCall.hasHit()) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[convexResultCall.get_m_hitCollisionObject().getUserIndex()];
                out.hitFraction = convexResultCall.get_m_closestHitFraction();
                var nativePoint = convexResultCall.get_m_hitPointWorld();
                var nativeNormal = convexResultCall.get_m_hitNormalWorld();
                var point = out.point;
                var normal = out.normal;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            if (out)
                out.succeeded = false;
            return false;
        }
    }
    shapeCastAll(shape, fromPosition, toPosition, out, fromRotation = null, toRotation = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
        var convexResultCall = this._nativeAllConvexResultCallback;
        var convexPosFrom = PhysicsSimulation._nativeTempVector30;
        var convexPosTo = PhysicsSimulation._nativeTempVector31;
        var convexRotFrom = PhysicsSimulation._nativeTempQuaternion0;
        var convexRotTo = PhysicsSimulation._nativeTempQuaternion1;
        var convexTransform = PhysicsSimulation._nativeTempTransform0;
        var convexTransTo = PhysicsSimulation._nativeTempTransform1;
        var sweepShape = shape._nativeShape;
        out.length = 0;
        convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
        convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);
        convexResultCall.set_m_collisionFilterGroup(collisonGroup);
        convexResultCall.set_m_collisionFilterMask(collisionMask);
        convexTransform.setOrigin(convexPosFrom);
        convexTransTo.setOrigin(convexPosTo);
        if (fromRotation) {
            convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            convexTransform.setRotation(convexRotFrom);
        }
        else {
            convexTransform.setRotation(this._nativeDefaultQuaternion);
        }
        if (toRotation) {
            convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
            convexTransTo.setRotation(convexRotTo);
        }
        else {
            convexTransTo.setRotation(this._nativeDefaultQuaternion);
        }
        var collisionObjects = convexResultCall.get_m_collisionObjects();
        collisionObjects.clear();
        this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        var count = collisionObjects.size();
        if (count > 0) {
            var nativePoints = convexResultCall.get_m_hitPointWorld();
            var nativeNormals = convexResultCall.get_m_hitNormalWorld();
            var nativeFractions = convexResultCall.get_m_hitFractions();
            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
                hitResult.hitFraction = nativeFractions.at(i);
                var nativePoint = nativePoints.at(i);
                var point = hitResult.point;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                var nativeNormal = nativeNormals.at(i);
                var normal = hitResult.normal;
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            return false;
        }
    }
    addConstraint(constraint, disableCollisionsBetweenLinkedBodies = false) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
        constraint._simulation = this;
    }
    removeConstraint(constraint) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
    }
    _updatePhysicsTransformFromRender() {
        var elements = this._physicsUpdateList.elements;
        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
            var physicCollider = elements[i];
            physicCollider._derivePhysicsTransformation(false);
            physicCollider._inPhysicUpdateListIndex = -1;
        }
        this._physicsUpdateList.length = 0;
    }
    _updateCharacters() {
        for (var i = 0, n = this._characters.length; i < n; i++) {
            var character = this._characters[i];
            character._updateTransformComponent(character._nativeColliderObject.getWorldTransform());
        }
    }
    _updateCollisions() {
        this._collisionsUtils.recoverAllContactPointsPool();
        var previous = this._currentFrameCollisions;
        this._currentFrameCollisions = this._previousFrameCollisions;
        this._currentFrameCollisions.length = 0;
        this._previousFrameCollisions = previous;
        var loopCount = Stat.loopCount;
        var numManifolds = this._nativeDispatcher.getNumManifolds();
        for (var i = 0; i < numManifolds; i++) {
            var contactManifold = this._nativeDispatcher.getManifoldByIndexInternal(i);
            var componentA = PhysicsComponent._physicObjectsMap[contactManifold.getBody0().getUserIndex()];
            var componentB = PhysicsComponent._physicObjectsMap[contactManifold.getBody1().getUserIndex()];
            var collision = null;
            var isFirstCollision;
            var contacts = null;
            var isTrigger = componentA.isTrigger || componentB.isTrigger;
            if (isTrigger && (componentA.owner._needProcessTriggers || componentB.owner._needProcessTriggers)) {
                var numContacts = contactManifold.getNumContacts();
                for (var j = 0; j < numContacts; j++) {
                    var pt = contactManifold.getContactPoint(j);
                    var distance = pt.getDistance();
                    if (distance <= 0) {
                        collision = this._collisionsUtils.getCollision(componentA, componentB);
                        contacts = collision.contacts;
                        isFirstCollision = collision._updateFrame !== loopCount;
                        if (isFirstCollision) {
                            collision._isTrigger = true;
                            contacts.length = 0;
                        }
                        break;
                    }
                }
            }
            else if (componentA.owner._needProcessCollisions || componentB.owner._needProcessCollisions) {
                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {
                    numContacts = contactManifold.getNumContacts();
                    for (j = 0; j < numContacts; j++) {
                        pt = contactManifold.getContactPoint(j);
                        distance = pt.getDistance();
                        if (distance <= 0) {
                            var contactPoint = this._collisionsUtils.getContactPoints();
                            contactPoint.colliderA = componentA;
                            contactPoint.colliderB = componentB;
                            contactPoint.distance = distance;
                            var nativeNormal = pt.get_m_normalWorldOnB();
                            var normal = contactPoint.normal;
                            normal.x = -nativeNormal.x();
                            normal.y = nativeNormal.y();
                            normal.z = nativeNormal.z();
                            var nativePostionA = pt.get_m_positionWorldOnA();
                            var positionOnA = contactPoint.positionOnA;
                            positionOnA.x = -nativePostionA.x();
                            positionOnA.y = nativePostionA.y();
                            positionOnA.z = nativePostionA.z();
                            var nativePostionB = pt.get_m_positionWorldOnB();
                            var positionOnB = contactPoint.positionOnB;
                            positionOnB.x = -nativePostionB.x();
                            positionOnB.y = nativePostionB.y();
                            positionOnB.z = nativePostionB.z();
                            if (!collision) {
                                collision = this._collisionsUtils.getCollision(componentA, componentB);
                                contacts = collision.contacts;
                                isFirstCollision = collision._updateFrame !== loopCount;
                                if (isFirstCollision) {
                                    collision._isTrigger = false;
                                    contacts.length = 0;
                                }
                            }
                            contacts.push(contactPoint);
                        }
                    }
                }
            }
            if (collision && isFirstCollision) {
                this._currentFrameCollisions.push(collision);
                collision._setUpdateFrame(loopCount);
            }
        }
    }
    _eventScripts() {
        var loopCount = Stat.loopCount;
        for (var i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
            var curFrameCol = this._currentFrameCollisions[i];
            var colliderA = curFrameCol._colliderA;
            var colliderB = curFrameCol._colliderB;
            if (colliderA.destroyed || colliderB.destroyed)
                continue;
            if (loopCount - curFrameCol._lastUpdateFrame === 1) {
                var ownerA = colliderA.owner;
                var scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (curFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (var j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerStay(colliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                curFrameCol.other = colliderB;
                                scriptsA[j].onCollisionStay(curFrameCol);
                            }
                        }
                    }
                }
                var ownerB = colliderB.owner;
                var scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (curFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerStay(colliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                curFrameCol.other = colliderA;
                                scriptsB[j].onCollisionStay(curFrameCol);
                            }
                        }
                    }
                }
            }
            else {
                ownerA = colliderA.owner;
                scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (curFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerEnter(colliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                curFrameCol.other = colliderB;
                                scriptsA[j].onCollisionEnter(curFrameCol);
                            }
                        }
                    }
                }
                ownerB = colliderB.owner;
                scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (curFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerEnter(colliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                curFrameCol.other = colliderA;
                                scriptsB[j].onCollisionEnter(curFrameCol);
                            }
                        }
                    }
                }
            }
        }
        for (i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
            var preFrameCol = this._previousFrameCollisions[i];
            var preColliderA = preFrameCol._colliderA;
            var preColliderB = preFrameCol._colliderB;
            if (preColliderA.destroyed || preColliderB.destroyed)
                continue;
            if (loopCount - preFrameCol._updateFrame === 1) {
                this._collisionsUtils.recoverCollision(preFrameCol);
                ownerA = preColliderA.owner;
                scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (preFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerExit(preColliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                preFrameCol.other = preColliderB;
                                scriptsA[j].onCollisionExit(preFrameCol);
                            }
                        }
                    }
                }
                ownerB = preColliderB.owner;
                scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (preFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerExit(preColliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                preFrameCol.other = preColliderA;
                                scriptsB[j].onCollisionExit(preFrameCol);
                            }
                        }
                    }
                }
            }
        }
    }
    clearForces() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.clearForces();
    }
}
PhysicsSimulation.PHYSICSENGINEFLAGS_NONE = 0x0;
PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
PhysicsSimulation.PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
PhysicsSimulation.PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;
PhysicsSimulation.SOLVERMODE_RANDMIZE_ORDER = 1;
PhysicsSimulation.SOLVERMODE_FRICTION_SEPARATE = 2;
PhysicsSimulation.SOLVERMODE_USE_WARMSTARTING = 4;
PhysicsSimulation.SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
PhysicsSimulation.SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
PhysicsSimulation.SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
PhysicsSimulation.SOLVERMODE_CACHE_FRIENDLY = 128;
PhysicsSimulation.SOLVERMODE_SIMD = 256;
PhysicsSimulation.SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
PhysicsSimulation.SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
PhysicsSimulation._tempVector30 = new Vector3();
PhysicsSimulation.disableSimulation = false;
