import { AABB } from '../collision/AABB.js';
import { GJKPairDetector } from '../collision/GJKEPA.js';
import { Ray } from '../collision/Ray.js';
import { ContactEquation } from '../equations/ContactEquation.js';
import { FrictionEquation } from '../equations/FrictionEquation.js';
import { ContactMaterial } from '../material/ContactMaterial.js';
import { Quaternion } from '../math/Quaternion.js';
import { Transform } from '../math/Transform.js';
import { Vec3 } from '../math/Vec3.js';
import { Body, BODYTYPE } from '../objects/Body.js';
import { Box } from '../shapes/Box.js';
import { Capsule } from '../shapes/Capsule.js';
import { ConvexPolyhedron, hitInfo } from '../shapes/ConvexPolyhedron.js';
import { Heightfield } from '../shapes/Heightfield.js';
import { Particle } from '../shapes/Particle.js';
import { Plane } from '../shapes/Plane.js';
import { HitPointInfo, HitPointInfoArray, Shape, SHAPETYPE } from '../shapes/Shape.js';
import { Sphere } from '../shapes/Sphere.js';
import { Trimesh } from '../shapes/Trimesh.js';
import { Voxel } from '../shapes/Voxel.js';
import { Vec3Pool } from '../utils/Vec3Pool.js';
import { World } from './World.js';

//declare type anyShape=Box|Sphere|Capsule|Voxel|ConvexPolyhedron|Heightfield|Trimesh;
interface checkFunc {
    (si: any, sj: any, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
}

var shapeChecks: checkFunc[] = [];

let sphereVoxel_hitPoints = new HitPointInfoArray();
sphereVoxel_hitPoints.reserve(32);

export var enableFriction = true;

/**
 * Helper class for the World. Generates ContactEquations.
 * @class Narrowphase
 * @constructor
 * @todo Sphere-ConvexPolyhedron contacts
 * @todo Contact reduction
 * @todo  should move methods to prototype
 */
export class Narrowphase {
    /**
     * Internal storage of pooled contact points.
     */
    contactPointPool: ContactEquation[] = [];

    frictionEquationPool: FrictionEquation[] = [];

    /**
     * 碰撞结果保存为 ContactEquation
     */
    result: ContactEquation[] = [];
    frictionResult: FrictionEquation[] = [];

    /**
     * Pooled vectors.
     * @property {Vec3Pool} v3pool
     */
    v3pool = new Vec3Pool();

    world: World;
    currentContactMaterial: ContactMaterial;

    /**
     * @property {Boolean} enableFrictionReduction
     */
    enableFrictionReduction = false;

	gjkdist = new GJKPairDetector();

    constructor(world: World) {
        this.world = world;
        shapeChecks[SHAPETYPE.BOX] = this.boxBox;
        shapeChecks[SHAPETYPE.BOX | SHAPETYPE.CONVEXPOLYHEDRON] = this.boxConvex;
        shapeChecks[SHAPETYPE.BOX | SHAPETYPE.PARTICLE] = this.boxParticle;
        shapeChecks[SHAPETYPE.BOX | SHAPETYPE.VOXEL] = this.boxVoxel;
        shapeChecks[SHAPETYPE.SPHERE] = this.sphereSphere;
        shapeChecks[SHAPETYPE.PLANE | SHAPETYPE.TRIMESH] = this.planeTrimesh;
        shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.TRIMESH] = this.sphereTrimesh;
        shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.PLANE] = this.spherePlane;
        shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.BOX] = this.sphereBox;
        shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.CONVEXPOLYHEDRON] = this.sphereConvex;
        shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.VOXEL] = this.sphereVoxel;
		shapeChecks[SHAPETYPE.CAPSULE] = this.CapsuleCapsule;
		shapeChecks[SHAPETYPE.CAPSULE| SHAPETYPE.PLANE ] = this.planeCapsule;
		shapeChecks[SHAPETYPE.CAPSULE| SHAPETYPE.SPHERE] = this.sphereCapsule;
		shapeChecks[SHAPETYPE.BOX|SHAPETYPE.CAPSULE] = this.boxCapsule;
        shapeChecks[SHAPETYPE.PLANE | SHAPETYPE.BOX] = this.planeBox;
        shapeChecks[SHAPETYPE.PLANE | SHAPETYPE.CONVEXPOLYHEDRON] = this.planeConvex;
        shapeChecks[SHAPETYPE.CONVEXPOLYHEDRON] = this.convexConvex;
        shapeChecks[SHAPETYPE.PLANE | SHAPETYPE.PARTICLE] = this.planeParticle;
        shapeChecks[SHAPETYPE.PARTICLE | SHAPETYPE.SPHERE] = this.sphereParticle;
        shapeChecks[SHAPETYPE.PARTICLE | SHAPETYPE.CONVEXPOLYHEDRON] = this.convexParticle;
        shapeChecks[SHAPETYPE.CONVEXPOLYHEDRON | SHAPETYPE.HEIGHTFIELD] = this.convexHeightfield;
        shapeChecks[SHAPETYPE.BOX | SHAPETYPE.HEIGHTFIELD] = this.boxHeightfield;
		shapeChecks[SHAPETYPE.SPHERE | SHAPETYPE.HEIGHTFIELD] = this.sphereHeightfield;
    }

    /**
     * Make a contact object, by using the internal pool or creating a new one.
     */
    createContactEquation(bi: Body, bj: Body, si: Shape, sj: Shape, overrideShapeA: Shape | null, overrideShapeB: Shape | null): ContactEquation {
        let c: ContactEquation;
        if (this.contactPointPool.length) {
            c = this.contactPointPool.pop() as ContactEquation;
            c.bi = bi;
            c.bj = bj;
        } else {
            c = new ContactEquation(bi, bj);
        }

        c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

        const cm = this.currentContactMaterial;

        c.restitution = cm.restitution;

        c.setSpookParams(
            cm.contactEquationStiffness,
            cm.contactEquationRelaxation,
            this.world.dt
        );

        const matA = si.material || bi.material;	// 优先使用shape的材质
        const matB = sj.material || bj.material;
        if (matA && matB && matA.restitution >= 0 && matB.restitution >= 0) {
            c.restitution = matA.restitution * matB.restitution;
        }

        c.si = overrideShapeA || si;
        c.sj = overrideShapeB || sj;

        return c;
    }

	/**
	 * 根据contact创建摩擦约束。每个contact会创建两个摩擦约束，在tangent的两个方向
	 * @param contactEq 
	 * @param outArray 
	 */
    createFrictionEquationsFromContact(contactEq: ContactEquation, outArray: FrictionEquation[]) {
		if(!enableFriction)
			return;
        const bodyA = contactEq.bi;
        const bodyB = contactEq.bj;
        const shapeA = contactEq.si;
        const shapeB = contactEq.sj;

        const world = this.world;
        const cm = this.currentContactMaterial;

        // If friction or restitution were specified in the material, use them
        let friction = cm.friction;
        const matA = shapeA.material || bodyA.material;	// 优先使用shape的材质
		const matB = shapeB.material || bodyB.material;
		// 如果shape有材质，就用shape之间的参数，否则，直接使用cm的
        if (matA && matB && matA.friction >= 0 && matB.friction >= 0) {
            friction = matA.friction * matB.friction;
        }

        if (friction > 0) {
			// Create 2 tangent equations
			// TODO 这里要改成 a和b的受力在法线上的投影?
			// 最大力受到摩擦系数的影响
			let maxf = Math.max( world.gravity.lengthSquared(),bodyA.force.lengthSquared(), bodyB.force.lengthSquared());
			const mug = friction * Math.sqrt(maxf);
            let reducedMass = (bodyA.invMass + bodyB.invMass);
            if (reducedMass > 0) {
                reducedMass = 1 / reducedMass;
            }
            const pool = this.frictionEquationPool;
            const c1 = pool.length ? pool.pop() as FrictionEquation : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
            const c2 = pool.length ? pool.pop() as FrictionEquation : new FrictionEquation(bodyA, bodyB, mug * reducedMass);

            c1.bi = c2.bi = bodyA;
            c1.bj = c2.bj = bodyB;
            c1.minForce = c2.minForce = -mug * reducedMass;
            c1.maxForce = c2.maxForce = mug * reducedMass;

            // Copy over the relative vectors
            c1.ri.copy(contactEq.ri);
            c1.rj.copy(contactEq.rj);
            c2.ri.copy(contactEq.ri);
            c2.rj.copy(contactEq.rj);

            // Construct tangents
            contactEq.ni.tangents(c1.t, c2.t);

            // Set spook params
            c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
            c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);

            c1.enabled = c2.enabled = contactEq.enabled;

            outArray.push(c1, c2);

            return true;
        }

        return false;
    }

    // Take the average N latest contact point on the plane.
    createFrictionFromAverage(numContacts: number) {
        // The last contactEquation
        let c = this.result[this.result.length - 1];

        // Create the result: two "average" friction equations
        if (!this.createFrictionEquationsFromContact(c, this.frictionResult) || numContacts === 1) {
            return;
        }

        const f1 = this.frictionResult[this.frictionResult.length - 2];
        const f2 = this.frictionResult[this.frictionResult.length - 1];

        averageNormal.setZero();
        averageContactPointA.setZero();
        averageContactPointB.setZero();

        const bodyA = c.bi;
        //const bodyB = c.bj;
        for (let i = 0; i !== numContacts; i++) {
            c = this.result[this.result.length - 1 - i];
            if (c.bi !== bodyA) {//c.bi?
                averageNormal.vadd(c.ni, averageNormal);
                averageContactPointA.vadd(c.ri, averageContactPointA);
                averageContactPointB.vadd(c.rj, averageContactPointB);
            } else {
                averageNormal.vsub(c.ni, averageNormal);
                averageContactPointA.vadd(c.rj, averageContactPointA);
                averageContactPointB.vadd(c.ri, averageContactPointB);
            }
        }

        const invNumContacts = 1 / numContacts;
        averageContactPointA.scale(invNumContacts, f1.ri);
        averageContactPointB.scale(invNumContacts, f1.rj);
        f2.ri.copy(f1.ri); // Should be the same
        f2.rj.copy(f1.rj);
        averageNormal.normalize();
        averageNormal.tangents(f1.t, f2.t);
        // return eq;
    }

    /**
     * Generate all contacts between a list of body pairs
     * @param  p1 Array of body indices
     * @param  p2 Array of body indices
     * @param  world
     * @param  result Array to store generated contacts
     * @param  oldcontacts Optional. Array of reusable contact objects
     */
    getContacts(p1: Body[], p2: Body[], world: World, result: ContactEquation[], oldcontacts: ContactEquation[], frictionResult: FrictionEquation[], frictionPool: FrictionEquation[]) {
        // Save old contact objects
        this.contactPointPool = oldcontacts;
        this.frictionEquationPool = frictionPool;
        this.result = result;
        this.frictionResult = frictionResult;

        const qi = tmpQuat1;
        const qj = tmpQuat2;
        const xi = tmpVec1;
        const xj = tmpVec2;

        for (let k = 0, N = p1.length; k !== N; k++) {
            // Get current collision bodies
            const bi = p1[k];
			const bj = p2[k];
			let typei = bi.type;
			let typej = bj.type;

            // Get contact material
            let bodyContactMaterial = null;
            if (bi.material && bj.material) {
                bodyContactMaterial = world.getContactMaterial(bi.material, bj.material);
            }

			const justTest =  
					typei & BODYTYPE.TRIGGER || 
					typej & BODYTYPE.TRIGGER ||
                    ((typei & BODYTYPE.KINEMATIC) && (typej & BODYTYPE.STATIC))   ||   // Kinematic vs static
                    ((typei & BODYTYPE.STATIC) && (typej & BODYTYPE.KINEMATIC))   ||   // static vs kinematix
                    ((typei & BODYTYPE.KINEMATIC) && (typej & BODYTYPE.KINEMATIC));    // kinematic vs kinematic

            //TODO
            let stepNum=0;

            for (let i = 0; i < bi.shapes.length; i++) {
				const si = bi.shapes[i];

				if(!si.enable) continue;

				let shapeoffi = bi.shapeOffsets[i];
				let shapeqi = bi.shapeOrientations[i];
				if(shapeqi){
					bi.quaternion.mult(shapeqi, qi);
				}else{
					qi.copy(bi.quaternion);
				}
				if(shapeoffi){
                	bi.quaternion.vmult(shapeoffi, xi);
					xi.vadd(bi.position, xi);
				}else{
					xi.copy(bi.position);
				}

                if(si.hasPreNarrowPhase)
                    si.onPreNarrowpase(stepNum,xi,qi);

                for (let j = 0; j < bj.shapes.length; j++) {
					const sj = bj.shapes[j];
					if(!sj.enable)
						continue;
					// Compute world transform of shapes
					let shapeoffj = bj.shapeOffsets[j];
					let shapeqj = bj.shapeOrientations[j];
					if(shapeqj){
						bj.quaternion.mult(shapeqj, qj);
					}else{
						qj.copy(bj.quaternion);
					}
					if(shapeoffj){
                    	bj.quaternion.vmult(shapeoffj, xj);
						xj.vadd(bj.position, xj);
					}else{
						xj.copy(bj.position);
					}
                    if(sj.hasPreNarrowPhase)
                        sj.onPreNarrowpase(stepNum,xj,qj);

                    // 碰撞组判断
                    if (!((si.collisionFilterMask & sj.collisionFilterGroup) && (sj.collisionFilterMask & si.collisionFilterGroup))) {
                        continue;
                    }

                    // 包围球判断
                    if (xi.distanceTo(xj) > si.boundSphR + sj.boundSphR) {
                        continue;
                    }

                    // Get collision material
                    let shapeContactMaterial = null;
                    if (si.material && sj.material) {
                        shapeContactMaterial = world.getContactMaterial(si.material, sj.material);
                    }

					// 材质的优先级：按照shape取的添加到world中的材质对关系，按照body取的天骄到world中的材质关系，世界缺省材质
                    this.currentContactMaterial = shapeContactMaterial || bodyContactMaterial || world.defaultContactMaterial;

                    // Get contacts
                    const resolver = shapeChecks[si.type | sj.type];
                    if (resolver) {
                        let retval = false;
                        if (si.type < sj.type) {
                            retval = resolver.call(this, si, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
                        } else {
                            retval = resolver.call(this, sj, si, xj, xi, qj, qi, bj, bi, si, sj, justTest);
                        }

                        if (retval && justTest) {
                            // Register overlap
                            //world.shapeOverlapKeeper.set(si.id, sj.id);
                            //world.bodyOverlapKeeper.set(bi.id, bj.id);
                        }
                    }
                }
            }
        }
    }

    boxBox(si: Box, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        si.convexPolyhedronRepresentation.material = si.material;
        sj.convexPolyhedronRepresentation.material = sj.material;
        si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
        sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
        return this.convexConvex(si.convexPolyhedronRepresentation, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
    }

    boxConvex(si: Box, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        si.convexPolyhedronRepresentation.material = si.material;
        si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
        return this.convexConvex(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
    }

    boxParticle(si: Box, sj: Particle, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        si.convexPolyhedronRepresentation.material = si.material;
        si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
        return this.convexParticle(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
    }


    sphereSphere(si: Sphere, sj: Sphere, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape|null, rsj: Shape|null, justTest: boolean): boolean {
        let hit = xi.distanceSquared(xj) < (si.radius + sj.radius) ** 2;
        if (!hit || justTest) {
            return hit;
        }

        // We will have only one contact in this case
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);

        // Contact normal
        xj.vsub(xi, r.ni);
        r.ni.normalize();

        // Contact point locations
        r.ri.copy(r.ni);
        r.rj.copy(r.ni);
        r.ri.scale(si.radius, r.ri);
        r.rj.scale(-sj.radius, r.rj);

        r.ri.vadd(xi, r.ri);
        r.ri.vsub(bi.position, r.ri);

        r.rj.vadd(xj, r.rj);
        r.rj.vsub(bj.position, r.rj);

        this.result.push(r);

        this.createFrictionEquationsFromContact(r, this.frictionResult);
        return true;
    }

    planeTrimesh(planeShape: Plane, trimeshShape: Trimesh, planePos: Vec3, trimeshPos: Vec3, planeQuat: Quaternion, trimeshQuat: Quaternion, planeBody: Body,
        trimeshBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        // Make contacts!
        const v = new Vec3();

        const normal = planeTrimesh_normal;
        normal.set(0, 0, 1);
        planeQuat.vmult(normal, normal); // Turn normal according to plane

        for (let i = 0; i < trimeshShape.vertices.length / 3; i++) {

            // Get world vertex from trimesh
            trimeshShape.getVertex(i, v);

            // Safe up
            const v2 = new Vec3();
            v2.copy(v);
            Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v);

            // Check plane side
            const relpos = planeTrimesh_relpos;
            v.vsub(planePos, relpos);
            const dot = normal.dot(relpos);

            if (dot <= 0.0) {
                if (justTest) {
                    return true;
                }

                const r = this.createContactEquation(planeBody, trimeshBody, planeShape, trimeshShape, rsi, rsj);

                r.ni.copy(normal); // Contact normal is the plane normal

                // Get vertex position projected on plane
                const projected = planeTrimesh_projected;
                normal.scale(relpos.dot(normal), projected);
                v.vsub(projected, projected);

                // ri is the projected world position minus plane position
                r.ri.copy(projected);
                r.ri.vsub(planeBody.position, r.ri);

                r.rj.copy(v);
                r.rj.vsub(trimeshBody.position, r.rj);

                // Store result
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
            return true;
        }
        return false;
    }

	/**
	 * 球与mesh的碰撞
	 * @param sphereShape 
	 * @param trimeshShape 
	 * @param spherePos 
	 * @param trimeshPos 
	 * @param sphereQuat 
	 * @param trimeshQuat 
	 * @param sphereBody 
	 * @param trimeshBody 
	 * @param rsi 
	 * @param rsj 
	 * @param justTest 
	 */
    sphereTrimesh(sphereShape: Sphere, trimeshShape: Trimesh, spherePos: Vec3, trimeshPos: Vec3, sphereQuat: Quaternion, trimeshQuat: Quaternion,
        sphereBody: Body, trimeshBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {

        const edgeVertexA = sphereTrimesh_edgeVertexA;
        const edgeVertexB = sphereTrimesh_edgeVertexB;
        const edgeVector = sphereTrimesh_edgeVector;
        const edgeVectorUnit = sphereTrimesh_edgeVectorUnit;
        const localSpherePos = sphereTrimesh_localSpherePos;
        const tmp = sphereTrimesh_tmp;
        const localSphereAABB = sphereTrimesh_localSphereAABB;
        const v2 = sphereTrimesh_v2;
        const relpos = sphereTrimesh_relpos;
        const triangles = sphereTrimesh_triangles;

        // Convert sphere position to local in the trimesh
        Transform.pointToLocalFrame(trimeshPos, trimeshQuat, spherePos, localSpherePos);

        // Get the aabb of the sphere locally in the trimesh
        const sphereRadius = sphereShape.radius;
        localSphereAABB.lowerBound.set(
            localSpherePos.x - sphereRadius,
            localSpherePos.y - sphereRadius,
            localSpherePos.z - sphereRadius
        );
        localSphereAABB.upperBound.set(
            localSpherePos.x + sphereRadius,
            localSpherePos.y + sphereRadius,
            localSpherePos.z + sphereRadius
        );

        trimeshShape.getTrianglesInAABB(localSphereAABB, triangles);
        //for (var i = 0; i < trimeshShape.indices.length / 3; i++) triangles.push(i); // All

        let hit = false;
        // Vertices
        const v = sphereTrimesh_v;
        const radiusSquared = sphereShape.radius * sphereShape.radius;
        for (var i = 0; i < triangles.length; i++) {
            for (var j = 0; j < 3; j++) {

                trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], v);

                // Check vertex overlap in sphere
                v.vsub(localSpherePos, relpos);

                if (relpos.lengthSquared() <= radiusSquared) {

                    // Safe up
                    v2.copy(v);
                    Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v);

                    v.vsub(spherePos, relpos);

                    hit = true;
                    if (justTest) {
                        return true;
                    }

                    var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
                    r.ni.copy(relpos);
                    r.ni.normalize();

                    // ri is the vector from sphere center to the sphere surface
                    r.ri.copy(r.ni);
                    r.ri.scale(sphereShape.radius, r.ri);
                    r.ri.vadd(spherePos, r.ri);
                    r.ri.vsub(sphereBody.position, r.ri);

                    r.rj.copy(v);
                    r.rj.vsub(trimeshBody.position, r.rj);

                    // Store result
                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
            }
        }

        // Check all edges
        for (var i = 0; i < triangles.length; i++) {
            for (var j = 0; j < 3; j++) {

                trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], edgeVertexA);
                trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + ((j + 1) % 3)], edgeVertexB);
                edgeVertexB.vsub(edgeVertexA, edgeVector);

                // Project sphere position to the edge
                localSpherePos.vsub(edgeVertexB, tmp);
                const positionAlongEdgeB = tmp.dot(edgeVector);

                localSpherePos.vsub(edgeVertexA, tmp);
                let positionAlongEdgeA = tmp.dot(edgeVector);

                if (positionAlongEdgeA > 0 && positionAlongEdgeB < 0) {

                    // Now check the orthogonal distance from edge to sphere center
                    localSpherePos.vsub(edgeVertexA, tmp);

                    edgeVectorUnit.copy(edgeVector);
                    edgeVectorUnit.normalize();
                    positionAlongEdgeA = tmp.dot(edgeVectorUnit);

                    edgeVectorUnit.scale(positionAlongEdgeA, tmp);
                    tmp.vadd(edgeVertexA, tmp);

                    // tmp is now the sphere center position projected to the edge, defined locally in the trimesh frame
                    var dist = tmp.distanceTo(localSpherePos);
                    if (dist < sphereShape.radius) {
                        hit = true;
                        if (justTest) {
                            return true;
                        }

                        var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);

                        tmp.vsub(localSpherePos, r.ni);
                        r.ni.normalize();
                        r.ni.scale(sphereShape.radius, r.ri);

                        Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
                        tmp.vsub(trimeshBody.position, r.rj);

                        Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
                        Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);

                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }
        }

        // Triangle faces
        const va = sphereTrimesh_va;
        const vb = sphereTrimesh_vb;
        const vc = sphereTrimesh_vc;
        const normal = sphereTrimesh_normal;
        for (let i = 0, N = triangles.length; i !== N; i++) {
            trimeshShape.getTriangleVertices(triangles[i], va, vb, vc);
            trimeshShape.getNormal(triangles[i], normal);
            localSpherePos.vsub(va, tmp);
            var dist = tmp.dot(normal);
            normal.scale(dist, tmp);
            localSpherePos.vsub(tmp, tmp);

            // tmp is now the sphere position projected to the triangle plane
            dist = tmp.distanceTo(localSpherePos);
            if (Ray.pointInTriangle(tmp, va, vb, vc) && dist < sphereShape.radius) {
                hit = true;
                if (justTest) {
                    return true;
                }
                var r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);

                tmp.vsub(localSpherePos, r.ni);
                r.ni.normalize();
                r.ni.scale(sphereShape.radius, r.ri);

                Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
                tmp.vsub(trimeshBody.position, r.rj);

                Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
                Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
        }

        triangles.length = 0;
        return hit;
    }

    private static nor1 = new Vec3();
    spherePlane(sphere: Sphere, plane: Plane, sphPos: Vec3, planePos: Vec3, qi: Quaternion, planeQ: Quaternion, sphBody: Body, planeBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        let ni = Narrowphase.nor1;  // 球的碰撞法线
        // 平面的法线转换到平面的朝向上
        ni.set(0, 0, 1);
        planeQ.vmult(ni, ni);
        ni.negate(ni); // 由于是球的碰撞法线，所以颠倒一下 body i is the sphere, flip normal
        ni.normalize(); // Needed?

        // Project down sphere on plane
        sphPos.vsub(planePos, point_on_plane_to_sphere);
        ni.scale(ni.dot(point_on_plane_to_sphere), plane_to_sphere_ortho);

        if (-point_on_plane_to_sphere.dot(ni) <= sphere.radius) {
            if (justTest) {
                return true;
            }

            const r = this.createContactEquation(sphBody, planeBody, sphere, plane, rsi, rsj);
            r.ni.copy(ni);
            // Vector from sphere center to contact point
            // 球的碰撞点
            ni.scale(sphere.radius, r.ri);// 长度为半径
            point_on_plane_to_sphere.vsub(plane_to_sphere_ortho, r.rj); // The sphere position projected to plane

            // Make it relative to the body
            const ri = r.ri;
            const rj = r.rj;
            ri.vadd(sphPos, ri);        
            ri.vsub(sphBody.position, ri);   // pos+hitV-a.pos  正常情况下 pos == a.pos
            rj.vadd(planePos, rj);
            rj.vsub(planeBody.position, rj);

            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
            return true;
        }
        return false;
    }


	bigSphereBox(si: Sphere, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
		let hitpos = sphereBox_ns;
		let hitpos1 = sphereBox_ns1;
		let ni = Narrowphase.nor1;
		let deep = Sphere.hitBox(xi,si.radius, sj.halfExtents,xj,qj,hitpos,hitpos1,ni,justTest);
		if(deep>=0){
			//debug
			/*
			let phyr = this.world._phyRender;
			phyr.addPoint1(hitpos,0xff);
			phyr.addPoint1(hitpos1,0xff00);
			phyr.addVec1(hitpos1,ni,10,0xffff00);
			*/
			//debug
			if(justTest) return true;
			let r = this.createContactEquation(bi,bj,si,sj,rsi,rsj);
			ni.negate(r.ni);
			hitpos.vsub(xi,r.ri);
			hitpos1.vsub(xj,r.rj);

            this.result.push(r);
			this.createFrictionEquationsFromContact(r, this.frictionResult);
			return true;
		}
		return false;
	}

    sphereBox(si: Sphere, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        const v3pool = this.v3pool;

		let half = sj.halfExtents;
		let maxw = Math.max(half.x,half.y,half.z);

		//if(si.radius>4*maxw){
			return this.bigSphereBox(si,sj,xi,xj,qi,qj,bi,bj,rsi,rsj,justTest);
		//}
        // we refer to the box as body j
        const sides = sphereBox_sides;
        xi.vsub(xj, box_to_sphere);
        sj.getSideNormals(sides, qj);
        const R = si.radius;
        //const penetrating_sides = [];

        // Check side (plane) intersections
        let found = false;

        // Store the resulting side penetration info
        const side_ns = sphereBox_side_ns;
        const side_ns1 = sphereBox_side_ns1;
        const side_ns2 = sphereBox_side_ns2;
        let side_h: f32 = 0;
        let side_penetrations = 0;
        let side_dot1 = 0;
        let side_dot2 = 0;
        let side_distance = null;
        for (let idx = 0, nsides = sides.length; idx !== nsides && found === false; idx++) {
            // Get the plane side normal (ns)
            const ns = sphereBox_ns;
            ns.copy(sides[idx]);

            const h = ns.length();
            ns.normalize();

            // The normal/distance dot product tells which side of the plane we are
            const dot = box_to_sphere.dot(ns);

            if (dot < h + R && dot > 0) {
                // Intersects plane. Now check the other two dimensions
                const ns1 = sphereBox_ns1;
                const ns2 = sphereBox_ns2;
                ns1.copy(sides[(idx + 1) % 3]);
                ns2.copy(sides[(idx + 2) % 3]);
                const h1 = ns1.length();
                const h2 = ns2.length();
                ns1.normalize();
                ns2.normalize();
                const dot1 = box_to_sphere.dot(ns1);
                const dot2 = box_to_sphere.dot(ns2);
                if (dot1 < h1 && dot1 > -h1 && dot2 < h2 && dot2 > -h2) {
                    let dist = Math.abs(dot - h - R);
                    if (side_distance === null || dist < side_distance) {
                        side_distance = dist;
                        side_dot1 = dot1;
                        side_dot2 = dot2;
                        side_h = h;
                        side_ns.copy(ns);
                        side_ns1.copy(ns1);
                        side_ns2.copy(ns2);
                        side_penetrations++;

                        if (justTest) {
                            return true;
                        }
                    }
                }
            }
        }
        if (side_penetrations) {
            found = true;
            let r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            side_ns.scale(-R, r.ri); // Sphere r
            r.ni.copy(side_ns);
            r.ni.negate(r.ni); // Normal should be out of sphere
            side_ns.scale(side_h, side_ns);
            side_ns1.scale(side_dot1, side_ns1);
            side_ns.vadd(side_ns1, side_ns);
            side_ns2.scale(side_dot2, side_ns2);
            side_ns.vadd(side_ns2, r.rj);

            // Make relative to bodies
            r.ri.vadd(xi, r.ri);
            r.ri.vsub(bi.position, r.ri);
            r.rj.vadd(xj, r.rj);
            r.rj.vsub(bj.position, r.rj);

            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
        }

        // Check corners
        let rj = v3pool.get();
        const sphere_to_corner = sphereBox_sphere_to_corner;
        for (var j = 0; j !== 2 && !found; j++) {
            for (var k = 0; k !== 2 && !found; k++) {
                for (var l = 0; l !== 2 && !found; l++) {
                    rj.set(0, 0, 0);
                    if (j) {
                        rj.vadd(sides[0], rj);
                    } else {
                        rj.vsub(sides[0], rj);
                    }
                    if (k) {
                        rj.vadd(sides[1], rj);
                    } else {
                        rj.vsub(sides[1], rj);
                    }
                    if (l) {
                        rj.vadd(sides[2], rj);
                    } else {
                        rj.vsub(sides[2], rj);
                    }

                    // World position of corner
                    xj.vadd(rj, sphere_to_corner);
                    sphere_to_corner.vsub(xi, sphere_to_corner);

                    if (sphere_to_corner.lengthSquared() < R * R) {
                        if (justTest) {
                            return true;
                        }
                        found = true;
                        let r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                        r.ri.copy(sphere_to_corner);
                        r.ri.normalize();
                        r.ni.copy(r.ri);
                        r.ri.scale(R, r.ri);
                        r.rj.copy(rj);

                        // Make relative to bodies
                        r.ri.vadd(xi, r.ri);
                        r.ri.vsub(bi.position, r.ri);
                        r.rj.vadd(xj, r.rj);
                        r.rj.vsub(bj.position, r.rj);

                        this.result.push(r);
                        this.createFrictionEquationsFromContact(r, this.frictionResult);
                    }
                }
            }
        }
        v3pool.release(rj);
        //rj = null;

        // Check edges
        const edgeTangent = v3pool.get() as Vec3;
        const edgeCenter = v3pool.get() as Vec3;
        var r: Vec3 = v3pool.get() as Vec3; // r = edge center to sphere center
        const orthogonal = v3pool.get() as Vec3;
        var dist: Vec3 = v3pool.get() as Vec3;
        const Nsides = sides.length;
        for (var j = 0; j !== Nsides && !found; j++) {
            for (var k = 0; k !== Nsides && !found; k++) {
                if (j % 3 !== k % 3) {
                    // Get edge tangent
                    sides[k].cross(sides[j], edgeTangent);
                    edgeTangent.normalize();
                    sides[j].vadd(sides[k], edgeCenter);
                    r.copy(xi);
                    r.vsub(edgeCenter, r);
                    r.vsub(xj, r);
                    const orthonorm = r.dot(edgeTangent); // distance from edge center to sphere center in the tangent direction
                    edgeTangent.scale(orthonorm, orthogonal); // Vector from edge center to sphere center in the tangent direction

                    // Find the third side orthogonal to this one
                    var l = 0;
                    while (l === j % 3 || l === k % 3) {
                        l++;
                    }

                    // vec from edge center to sphere projected to the plane orthogonal to the edge tangent
                    dist.copy(xi);
                    dist.vsub(orthogonal, dist);
                    dist.vsub(edgeCenter, dist);
                    dist.vsub(xj, dist);

                    // Distances in tangent direction and distance in the plane orthogonal to it
                    const tdist = Math.abs(orthonorm);
                    const ndist = dist.length();

                    if (tdist < sides[l].length() && ndist < R) {
                        if (justTest) {
                            return true;
                        }
                        found = true;
                        const res = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                        edgeCenter.vadd(orthogonal, res.rj); // box rj
                        res.rj.copy(res.rj);
                        dist.negate(res.ni);
                        res.ni.normalize();

                        res.ri.copy(res.rj);
                        res.ri.vadd(xj, res.ri);
                        res.ri.vsub(xi, res.ri);
                        res.ri.normalize();
                        res.ri.scale(R, res.ri);

                        // Make relative to bodies
                        res.ri.vadd(xi, res.ri);
                        res.ri.vsub(bi.position, res.ri);
                        res.rj.vadd(xj, res.rj);
                        res.rj.vsub(bj.position, res.rj);

                        this.result.push(res);
                        this.createFrictionEquationsFromContact(res, this.frictionResult);
                    }
                }
            }
        }
        v3pool.release(edgeTangent).release(edgeCenter).release(r).release(orthogonal).release(dist);
        return found;
    }

    sphereConvex(si: Sphere, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        const v3pool = this.v3pool;
        xi.vsub(xj, convex_to_sphere);
        const normals = sj.faceNormals;
        const faces = sj.faces;
        const verts = sj.vertices;
        const R = si.radius;
        //const penetrating_sides = [];

        // if(convex_to_sphere.norm2() > si.boundingSphereRadius + sj.boundingSphereRadius){
        //     return;
        // }

        // Check corners
        for (var i = 0; i !== verts.length; i++) {
            const v = verts[i];

            // World position of corner
            const worldCorner = sphereConvex_worldCorner;
            qj.vmult(v, worldCorner);
            xj.vadd(worldCorner, worldCorner);  // v转换到是世界空间
            //DEBUG
            //let phyr = this.world.phyRender as PhyRender;//
            //phyr.addPoint1(worldCorner,0xff0000);
            //DEBUG
            const sphere_to_corner = sphereConvex_sphereToCorner;
            worldCorner.vsub(xi, sphere_to_corner);
            if (sphere_to_corner.lengthSquared() < R * R) {
                if (justTest) {
                    return true;
                }
                found = true;
                var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                r.ri.copy(sphere_to_corner);
                r.ri.normalize();
                r.ni.copy(r.ri);
                r.ri.scale(R, r.ri);
                worldCorner.vsub(xj, r.rj);

                // Should be relative to the body.
                r.ri.vadd(xi, r.ri);
                r.ri.vsub(bi.position, r.ri);

                // Should be relative to the body.
                r.rj.vadd(xj, r.rj);
                r.rj.vsub(bj.position, r.rj);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
                return true;
            }
        }

        // Check side (plane) intersections
        var found = false;
        for (let i = 0, nfaces = faces.length; i !== nfaces && found === false; i++) {
            const normal = normals[i];
            const face = faces[i];

            // Get world-transformed normal of the face
            const worldNormal = sphereConvex_worldNormal;
            qj.vmult(normal, worldNormal);

            // Get a world vertex from the face
            const worldPoint = sphereConvex_worldPoint;
            qj.vmult(verts[face[0]], worldPoint);
            worldPoint.vadd(xj, worldPoint);

            // Get a point on the sphere, closest to the face normal
            const worldSpherePointClosestToPlane = sphereConvex_worldSpherePointClosestToPlane;
            worldNormal.scale(-R, worldSpherePointClosestToPlane);
            xi.vadd(worldSpherePointClosestToPlane, worldSpherePointClosestToPlane);

            // Vector from a face point to the closest point on the sphere
            const penetrationVec = sphereConvex_penetrationVec;
            worldSpherePointClosestToPlane.vsub(worldPoint, penetrationVec);

            // The penetration. Negative value means overlap.
            const penetration = penetrationVec.dot(worldNormal);

            const worldPointToSphere = sphereConvex_sphereToWorldPoint;
            xi.vsub(worldPoint, worldPointToSphere);

            if (penetration < 0 && worldPointToSphere.dot(worldNormal) > 0) {
                // Intersects plane. Now check if the sphere is inside the face polygon
                const faceVerts = []; // Face vertices, in world coords
                for (var j = 0, Nverts = face.length; j !== Nverts; j++) {
                    const worldVertex = v3pool.get();
                    qj.vmult(verts[face[j]], worldVertex);
                    xj.vadd(worldVertex, worldVertex);
                    faceVerts.push(worldVertex);
                }

                if (pointInPolygon(faceVerts, worldNormal, xi)) { // Is the sphere center in the face polygon?
                    if (justTest) {
                        return true;
                    }
                    found = true;
                    var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);

                    worldNormal.scale(-R, r.ri); // Contact offset, from sphere center to contact
                    worldNormal.negate(r.ni); // Normal pointing out of sphere

                    const penetrationVec2 = v3pool.get();
                    worldNormal.scale(-penetration, penetrationVec2);
                    const penetrationSpherePoint = v3pool.get();
                    worldNormal.scale(-R, penetrationSpherePoint);

                    //xi.vsub(xj).vadd(penetrationSpherePoint).vadd(penetrationVec2 , r.rj);
                    xi.vsub(xj, r.rj);
                    r.rj.vadd(penetrationSpherePoint, r.rj);
                    r.rj.vadd(penetrationVec2, r.rj);

                    // Should be relative to the body.
                    r.rj.vadd(xj, r.rj);
                    r.rj.vsub(bj.position, r.rj);

                    // Should be relative to the body.
                    r.ri.vadd(xi, r.ri);
                    r.ri.vsub(bi.position, r.ri);

                    v3pool.release(penetrationVec2);
                    v3pool.release(penetrationSpherePoint);

                    this.result.push(r);
                    this.createFrictionEquationsFromContact(r, this.frictionResult);

                    // Release world vertices
                    for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                        v3pool.release(faceVerts[j]);
                    }

                    return true; // We only expect *one* face contact
                } else {
                    // Edge?
                    for (var j = 0; j !== face.length; j++) {

                        // Get two world transformed vertices
                        const v1 = v3pool.get();
                        const v2 = v3pool.get();
                        qj.vmult(verts[face[(j + 1) % face.length]], v1);
                        qj.vmult(verts[face[(j + 2) % face.length]], v2);
                        xj.vadd(v1, v1);
                        xj.vadd(v2, v2);

                        // Construct edge vector
                        const edge = sphereConvex_edge;
                        v2.vsub(v1, edge);

                        // Construct the same vector, but normalized
                        const edgeUnit = sphereConvex_edgeUnit;
                        edge.unit(edgeUnit);

                        // p is xi projected onto the edge
                        const p = v3pool.get();
                        const v1_to_xi = v3pool.get();
                        xi.vsub(v1, v1_to_xi);
                        const dot = v1_to_xi.dot(edgeUnit);
                        edgeUnit.scale(dot, p);
                        p.vadd(v1, p);

                        // Compute a vector from p to the center of the sphere
                        const xi_to_p = v3pool.get();
                        p.vsub(xi, xi_to_p);

                        // Collision if the edge-sphere distance is less than the radius
                        // AND if p is in between v1 and v2
                        if (dot > 0 && dot * dot < edge.lengthSquared() && xi_to_p.lengthSquared() < R * R) { // Collision if the edge-sphere distance is less than the radius
                            // Edge contact!
                            if (justTest) {
                                return true;
                            }
                            var r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                            p.vsub(xj, r.rj);

                            p.vsub(xi, r.ni);
                            r.ni.normalize();

                            r.ni.scale(R, r.ri);

                            // Should be relative to the body.
                            r.rj.vadd(xj, r.rj);
                            r.rj.vsub(bj.position, r.rj);

                            // Should be relative to the body.
                            r.ri.vadd(xi, r.ri);
                            r.ri.vsub(bi.position, r.ri);

                            this.result.push(r);
                            this.createFrictionEquationsFromContact(r, this.frictionResult);

                            // Release world vertices
                            for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                                v3pool.release(faceVerts[j]);
                            }

                            v3pool.release(v1);
                            v3pool.release(v2);
                            v3pool.release(p);
                            v3pool.release(xi_to_p);
                            v3pool.release(v1_to_xi);

                            return true;
                        }

                        v3pool.release(v1);
                        v3pool.release(v2);
                        v3pool.release(p);
                        v3pool.release(xi_to_p);
                        v3pool.release(v1_to_xi);
                    }
                }

                // Release world vertices
                for (var j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                    v3pool.release(faceVerts[j]);
                }
            }
        }
        return found;
    }
	
	/*
    sphereVoxel(sphere: Sphere, voxel: Voxel,  pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        let hitpoints:HitPointInfo[] = [];
        let hit = sphere.hitVoxel(pos1,voxel,pos2,q2,hitpoints,justTest);
        if(hit){
            if( justTest) return true;
            hitpoints.forEach( hit=>{
                let r = this.createContactEquation(body1,body2,sphere,voxel,rsi,rsj);
                hit.normal.negate(r.ni);
                //r.ni.copy(hit.normal);
                hit.posi.vsub(pos1,r.ri);
                hit.posj.vsub(pos2,r.rj);
    
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            })
            return true;
        }
        return false;
    }
	*/

    sphereVoxel(sphere: Sphere, voxel: Voxel,  pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
		//TEMP voxel的AABB的更新先在这里做，以后记得优化
		voxel.pos=pos2;
		voxel.quat = q2;
		voxel.updateAABB();
		//TEMP
		let hitpoints = sphereVoxel_hitPoints;
        let hit = sphere.hitVoxel1(pos1,voxel,pos2,q2,hitpoints,justTest);
        if(hit){
			if( justTest) return true;
			let hl = hitpoints.length;
			//let phyr = this.world.phyRender as PhyRender;
			for(let i=0; i<hl; i++){
				let hit = hitpoints.data[i];
				let r = this.createContactEquation(body1,body2,sphere,voxel,rsi,rsj);
				//debug
				//phyr.addPersistPoint(hit.posi);
				//phyr.addPersistVec(hit.normal, hit.posi)
				//debug
                hit.normal.negate(r.ni);
                //r.ni.copy(hit.normal);
                hit.posi.vsub(pos1,r.ri);
                hit.posj.vsub(pos2,r.rj);
    
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            }
            return true;
        }
        return false;
    }

	
	CapsuleCapsule(cap1: Capsule, cap2: Capsule,  pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
		let ni = Narrowphase.nor1;
		let hitpos = point_on_plane_to_sphere;
		let hit1 =Cap_Cap_tmpV1;
		let deep = cap1.hitCapsule(pos1,cap2,pos2,hitpos,hit1,ni,justTest);
		if(deep>=0){
			if(justTest) return true;
			let r = this.createContactEquation(body1,body2,cap1,cap2,rsi,rsj);
			ni.negate(ni);
			r.ni.copy(ni);
			hitpos.vsub(pos1,r.ri);
			hit1.vsub(pos2,r.rj);

            this.result.push(r);
			this.createFrictionEquationsFromContact(r, this.frictionResult);
			return true;
		}
		return false;
	}

    sphereCapsule(sphere: Sphere, capsule: Capsule,  sphPos: Vec3, capPos: Vec3, sphQ: Quaternion, capQ: Quaternion,  sphBody: Body, capBody: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
		let ni = Narrowphase.nor1;
		let hitpos = point_on_plane_to_sphere;
		let hit1 =Cap_Cap_tmpV1;
		let deep = capsule.hitSphere(capPos,sphere.radius,sphPos,hitpos,hit1,ni,justTest);
		if(deep>=0){
			if(justTest)return true;
			let r = this.createContactEquation(capBody,sphBody,capsule,sphere,rsi,rsj);
            ni.negate(ni);// 
			r.ni.copy(ni);
			hitpos.vsub(capPos,r.ri);
			hit1.vsub(sphPos,r.rj);

            this.result.push(r);
			this.createFrictionEquationsFromContact(r, this.frictionResult);
			return true;			
		}
		return false;
	}

    planeCapsule(plane: Plane, capsule: Capsule,  planePos: Vec3, capPos: Vec3, planeQ: Quaternion, capQ: Quaternion,  planeBody: Body, capBody: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        let ni = Narrowphase.nor1;  // 球的碰撞法线
        // 平面的法线转换到平面的朝向上
        ni.set(0, 0, 1);		// 平面法线，TODO 以后换成laya坐标系，0,1,0
        planeQ.vmult(ni, ni);
        ni.normalize(); // Needed?

        let nearToPlane = point_on_plane_to_sphere;
        let deep = capsule.hitPlane(capPos,planePos,ni,nearToPlane);
        if(deep>=0){
            if(justTest)
				return true;
            const r = this.createContactEquation(capBody, planeBody, capsule, plane, rsi, rsj);
            ni.negate(ni);// capsule身上的法线 -planeNormal
            r.ni.copy(ni);

            let planeHit = r.rj;	// 平面的碰撞点
            planeHit.copy(nearToPlane);	// r.rj = hitpos
            //DEBUG
            //this.world.phyRender._addPoint(nearToPlane, PhyColor.RED);
            //DEBUG
			planeHit.addScaledVector(-deep,ni,planeHit);//ni朝向平面里面 = rj
			planeHit.vsub(planeBody.position,planeHit);// 转到相对自己的位置

            // 把ri,rj转成相对坐标
            const ri = r.ri;
            ri.copy(nearToPlane);
            ri.vsub(capBody.position, ri);

            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
            return true;

        }
        return false;
    }

	static trans1=new Transform();
	static trans2=new Transform();
	boxCapsule(box: Box, capsule: Capsule,  boxPos: Vec3, capPos: Vec3, boxQ: Quaternion, capQ: Quaternion,  boxBody: Body, capBody: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
		let ni = Narrowphase.nor1;
		let hitpos = point_on_plane_to_sphere;
        let hit1 =Cap_Cap_tmpV1;
        
		let gjk = this.gjkdist;
		gjk.shapeA=box.minkowski;
		gjk.shapeB=capsule.minkowski;
		let transA = Narrowphase.trans1;
		let transB = Narrowphase.trans2;
		transA.position=boxPos;
		transA.quaternion=boxQ;
		transB.position=capPos;
		transB.quaternion=capQ;
		let deep = this.gjkdist.getClosestPoint(transA,transB, hitpos, hit1, ni, justTest);
		if(deep>=0){
			if(justTest)return true;
			let r = this.createContactEquation(boxBody,capBody, box, capsule, rsi, rsj);
            ni.negate(ni);// 
			r.ni.copy(ni);
			hitpos.vsub(boxPos,r.ri);
			hit1.vsub(capPos,r.rj);

            this.result.push(r);
			this.createFrictionEquationsFromContact(r, this.frictionResult);
			return true;			
		}
		return false;
	}

    boxVoxel(box: Box, voxel: Voxel,  pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body,  rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        let hitpoints:HitPointInfo[] = [];
        let hit = box.hitVoxel(pos1, q1, voxel,pos2,q2,hitpoints,justTest);
        if(hit){
            if( justTest) return true;
            //let ni = Narrowphase.nor1;
            hitpoints.forEach( hit=>{
                //DEBUG
                //let phyr = this.world._phyRender;
                //phyr.addPersistPoint(hit.posi);
                //phyr.addPersistPoint(hit.posj);
                //phyr.addPersistVec(hit.normal, hit.posi);
                //DEBUG
                    
                let r = this.createContactEquation(body1,body2,box,voxel,rsi,rsj);
                //hit.normal.negate(r.ni);
                r.ni.copy(hit.normal);  // 现在的法线是推开voxel的， 所以不用取反
                hit.posi.vsub(pos1,r.ri);
                hit.posj.vsub(pos2,r.rj);
    
                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            })
            return true;
        }
        return false;
    }

    planeBox(si: Plane, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        sj.convexPolyhedronRepresentation.material = sj.material;
        sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
        sj.convexPolyhedronRepresentation.id = sj.id;
        return this.planeConvex(si, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
    }

    planeConvex(planeShape: Plane, convexShape: ConvexPolyhedron,
        planePosition: Vec3, convexPosition: Vec3,
        planeQuat: Quaternion, convexQuat: Quaternion,
        planeBody: Body, convexBody: Body,
        si: Shape, sj: Shape,
        justTest: boolean
    ): boolean {
        // Simply return the points behind the plane.
        const worldVertex = planeConvex_v;

        const worldNormal = planeConvex_normal;
        worldNormal.set(0, 0, 1);
        planeQuat.vmult(worldNormal, worldNormal); // Turn normal according to plane orientation

        let hit = false;
        let numContacts = 0;
		const relpos = planeConvex_relpos;
        for (let i = 0; i !== convexShape.vertices.length; i++) {

            // Get world convex vertex
            worldVertex.copy(convexShape.vertices[i]);
            convexQuat.vmult(worldVertex, worldVertex);
            convexPosition.vadd(worldVertex, worldVertex);
            worldVertex.vsub(planePosition, relpos);

            const dot = worldNormal.dot(relpos);
            if (dot <= 0.0) {
                if (justTest) {
                    return true;
				}
                hit = true;
                const r = this.createContactEquation(planeBody, convexBody, planeShape, convexShape, si, sj);

                // Get vertex position projected on plane
                const projected = planeConvex_projected;
                worldNormal.scale(worldNormal.dot(relpos), projected);
                worldVertex.vsub(projected, projected);
                projected.vsub(planePosition, r.ri); // From plane to vertex projected on plane

                r.ni.copy(worldNormal); // Contact normal is the plane normal out from plane

                // rj is now just the vector from the convex center to the vertex
                worldVertex.vsub(convexPosition, r.rj);

                // Make it relative to the body
                r.ri.vadd(planePosition, r.ri);
                r.ri.vsub(planeBody.position, r.ri);
                r.rj.vadd(convexPosition, r.rj);
                r.rj.vsub(convexBody.position, r.rj);

                this.result.push(r);
                numContacts++;
                if (!this.enableFrictionReduction) {
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
            }
        }

        if (this.enableFrictionReduction && numContacts) {
            this.createFrictionFromAverage(numContacts);
        }
        return hit;
    }

    convexConvex(si: ConvexPolyhedron, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body,
        rsi: Shape | null, rsj: Shape | null, justTest: boolean, faceListA: number[] | null = null, faceListB: number[] | null = null): boolean {
        const sepAxis = convexConvex_sepAxis;

        if (xi.distanceTo(xj) > si.boundSphR + sj.boundSphR) {
            return false;
        }

        let hit = false;
        if (si.findSeparatingAxis(sj, xi, qi, xj, qj, sepAxis, faceListA, faceListB)) {
            const res: hitInfo[] = [];
            const q = convexConvex_q;
            si.clipAgainstHull(xi, qi, sj, xj, qj, sepAxis, -100, 100, res);
            let numContacts = 0;
            for (let j = 0; j !== res.length; j++) {
                if (justTest) {
                    return true;
                }
                hit = true;
                const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                const ri = r.ri;
                const rj = r.rj;
                sepAxis.negate(r.ni);
                res[j].normal.negate(q);
                q.scale(res[j].depth, q);
                res[j].point.vadd(q, ri);
                rj.copy(res[j].point);

                // Contact points are in world coordinates. Transform back to relative
                ri.vsub(xi, ri);
                rj.vsub(xj, rj);

                // Make relative to bodies
                ri.vadd(xi, ri);
                ri.vsub(bi.position, ri);
                rj.vadd(xj, rj);
				rj.vsub(bj.position, rj);

                this.result.push(r);
                numContacts++;
                if (!this.enableFrictionReduction) {
                    this.createFrictionEquationsFromContact(r, this.frictionResult);
                }
			}

            if (this.enableFrictionReduction && numContacts) {
                this.createFrictionFromAverage(numContacts);
            }
        }
        return hit;
    }

    planeParticle(sj: Plane, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        const normal = particlePlane_normal;
        normal.set(0, 0, 1);
        bj.quaternion.vmult(normal, normal); // Turn normal according to plane orientation
        const relpos = particlePlane_relpos;
        xi.vsub(bj.position, relpos);
        const dot = normal.dot(relpos);
        if (dot <= 0.0) {

            if (justTest) {
                return true;
            }

            const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            r.ni.copy(normal); // Contact normal is the plane normal
            r.ni.negate(r.ni);
            r.ri.set(0, 0, 0); // Center of particle

            // Get particle position projected on plane
            const projected = particlePlane_projected;
            normal.scale(normal.dot(xi), projected);
            xi.vsub(projected, projected);
            //projected.vadd(bj.position,projected);

            // rj is now the projected world position minus plane position
            r.rj.copy(projected);
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
            return true;
        }
        return false;
    }

    sphereParticle(sj: Sphere, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        // The normal is the unit vector from sphere center to particle center
        const normal = particleSphere_normal;
        normal.set(0, 0, 1);
        xi.vsub(xj, normal);
        const lengthSquared = normal.lengthSquared();

        if (lengthSquared <= sj.radius * sj.radius) {
            if (justTest) {
                return true;
            }
            const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            normal.normalize();
            r.rj.copy(normal);
            r.rj.scale(sj.radius, r.rj);
            r.ni.copy(normal); // Contact normal
            r.ni.negate(r.ni);
            r.ri.set(0, 0, 0); // Center of particle
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
            return true;
        }
        return false;
    }

    convexParticle(sj: ConvexPolyhedron, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        let penetratedFaceIndex: i32 = -1;
        const penetratedFaceNormal = convexParticle_penetratedFaceNormal;
        const worldPenetrationVec = convexParticle_worldPenetrationVec;
        let minPenetration: f32 | null = null;
        //let numDetectedFaces = 0;
        let hit = false;

        // Convert particle position xi to local coords in the convex
        const local = convexParticle_local;
        local.copy(xi);
        local.vsub(xj, local); // Convert position to relative the convex origin
        qj.conjugate(cqj);
        cqj.vmult(local, local);

        if (sj.pointIsInside(local)) {

            if (sj.worldVerticesNeedsUpdate) {
                sj.computeWorldVertices(xj, qj);
            }
            if (sj.worldFaceNormalsNeedsUpdate) {
                sj.computeWorldFaceNormals(qj);
            }

            // For each world polygon in the polyhedra
            for (let i = 0, nfaces = sj.faces.length; i !== nfaces; i++) {

                // Construct world face vertices
                const verts = [sj.worldVertices[sj.faces[i][0]]];
                const normal = sj.worldFaceNormals[i];

                // Check how much the particle penetrates the polygon plane.
                xi.vsub(verts[0], convexParticle_vertexToParticle);
                const penetration = -normal.dot(convexParticle_vertexToParticle);
                if (minPenetration === null || Math.abs(penetration) < Math.abs(minPenetration)) {

                    if (justTest) {
                        return true;
                    }
                    hit = true;
                    minPenetration = penetration;
                    penetratedFaceIndex = i;
                    penetratedFaceNormal.copy(normal);
                    //numDetectedFaces++;
                }
            }

            if (penetratedFaceIndex !== -1) {
                // Setup contact
                const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
                penetratedFaceNormal.scale(minPenetration as number, worldPenetrationVec);

                // rj is the particle position projected to the face
                worldPenetrationVec.vadd(xi, worldPenetrationVec);
                worldPenetrationVec.vsub(xj, worldPenetrationVec);
                r.rj.copy(worldPenetrationVec);
                //var projectedToFace = xi.vsub(xj).vadd(worldPenetrationVec);
                //projectedToFace.copy(r.rj);

                //qj.vmult(r.rj,r.rj);
                penetratedFaceNormal.negate(r.ni); // Contact normal
                r.ri.set(0, 0, 0); // Center of particle

                const ri = r.ri;
                const rj = r.rj;

                // Make relative to bodies
                ri.vadd(xi, ri);
                ri.vsub(bi.position, ri);
                rj.vadd(xj, rj);
                rj.vsub(bj.position, rj);

                this.result.push(r);
                this.createFrictionEquationsFromContact(r, this.frictionResult);
            } else {
                console.warn("Point found inside convex, but did not find penetrating face!");
            }
        }
        return hit;
    }

    convexHeightfield(
        convexShape: ConvexPolyhedron,
        hfShape: Heightfield,
        convexPos: Vec3,
        hfPos: Vec3,
        convexQuat: Quaternion,
        hfQuat: Quaternion,
        convexBody: Body,
        hfBody: Body,
        rsi: Shape,
        rsj: Shape,
        justTest: boolean
    ): boolean {
        const data = hfShape.data;
        const w = hfShape.elementSize;
        const radius = convexShape.boundSphR;
        const worldPillarOffset = convexHeightfield_tmp2;
        const faceList = convexHeightfield_faceList;

        // Get sphere position to heightfield local!
        const localConvexPos = convexHeightfield_tmp1;
        Transform.pointToLocalFrame(hfPos, hfQuat, convexPos, localConvexPos);

        // Get the index of the data points to test against
        let iMinX = Math.floor((localConvexPos.x - radius) / w) - 1;

        let iMaxX = Math.ceil((localConvexPos.x + radius) / w) + 1;
        let iMinZ = Math.floor((localConvexPos.z - radius) / w) - 1;
        let iMaxZ = Math.ceil((localConvexPos.z + radius) / w) + 1;

        // Bail out if we are out of the terrain
        if (iMaxX < 0 || iMaxZ < 0 || iMinX > data.length || iMinZ > data[0].length) {
            return false;
        }

        // Clamp index to edges
        if (iMinX < 0) { iMinX = 0; }
        if (iMaxX < 0) { iMaxX = 0; }
        if (iMinZ < 0) { iMinZ = 0; }
        if (iMaxZ < 0) { iMaxZ = 0; }
        if (iMinX >= data[0].length) { iMinX = data[0].length - 1; }
        if (iMaxX >= data[0].length) { iMaxX = data[0].length - 1; }
        if (iMaxZ >= data.length) { iMaxZ = data.length - 1; }
        if (iMinZ >= data.length) { iMinZ = data.length - 1; }

        const minMax: f32[] = [];
        hfShape.getRectMinMax(iMinX, iMinZ, iMaxX, iMaxZ, minMax);
        const min = minMax[0];
        const max = minMax[1];

        // Bail out if we're cant touch the bounding height box
        if (localConvexPos.y - radius > max || localConvexPos.y + radius < min) {
            return false;
        }

        let hit = false;
		for (let j = iMinZ; j < iMaxZ; j++) {
			for (let i = iMinX; i < iMaxX; i++) {
                let intersecting = false;
                // Lower triangle
                hfShape.getConvexTrianglePillar(i, j, false);
                Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + convexShape.boundSphR) {
                    intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
                }

                if (justTest && intersecting) {
                    return true;
                }

                hit = hit || intersecting;
                // Upper triangle
                hfShape.getConvexTrianglePillar(i, j, true);
                Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + convexShape.boundSphR) {
                    intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
                }

                hit = hit || intersecting;
                if (justTest && intersecting) {
                    return true;
                }
            }
        }
        return hit;
    }

    boxHeightfield(si: Box, sj: Heightfield, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean {
        si.convexPolyhedronRepresentation.material = si.material;
        si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
        return this.convexHeightfield(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
    }

    sphereHeightfield(sphereShape: Sphere, hfShape: Heightfield, spherePos: Vec3, hfPos: Vec3, sphereQuat: Quaternion, hfQuat: Quaternion,
        sphereBody: Body, hfBody: Body,
        rsi: Shape|null, rsj: Shape|null,
        justTest: boolean): boolean {

        const data = hfShape.data;
        const radius = sphereShape.radius;
        const w = hfShape.elementSize;
        const worldPillarOffset = sphereHeightfield_tmp2;

        // Get sphere position to heightfield local!
        const localSpherePos = sphereHeightfield_tmp1;
        Transform.pointToLocalFrame(hfPos, hfQuat, spherePos, localSpherePos);//sphere转换到hf空间

		// Get the index of the data points to test against
		// sphere覆盖的范围
        let iMinX = Math.floor((localSpherePos.x - radius) / w) - 1;
        let iMaxX = Math.ceil((localSpherePos.x + radius) / w) + 1;
        let iMinZ = Math.floor((localSpherePos.z - radius) / w) - 1;
        let iMaxZ = Math.ceil((localSpherePos.z + radius) / w) + 1;

		// Bail out if we are out of the terrain
		// 投影本身在格子外面
        if (iMaxX < 0 || iMaxZ < 0 || iMinX > data[0].length || iMaxZ > data.length) {
            return false;
        }

        // Clamp index to edges
        if (iMinX < 0) { iMinX = 0; }
        if (iMaxX < 0) { iMaxX = 0; }
        if (iMinZ < 0) { iMinZ = 0; }
        if (iMaxZ < 0) { iMaxZ = 0; }
        if (iMinX >= data[0].length) { iMinX = data[0].length - 1; }
        if (iMaxX >= data[0].length) { iMaxX = data[0].length - 1; }
        if (iMaxZ >= data.length) { iMaxZ = data.length - 1; }
        if (iMinZ >= data.length) { iMinZ = data.length - 1; }

        const minMax: f32[] = [];
        hfShape.getRectMinMax(iMinX, iMinZ, iMaxX, iMaxZ, minMax);
        const min = minMax[0];
        const max = minMax[1];

        // Bail out if we're cant touch the bounding height box
        if (localSpherePos.y - radius > max || localSpherePos.y + radius < min) {
            return false;
        }

        let hit = false;
        const result = this.result;
		for (let j = iMinZ; j < iMaxZ; j++) {
			for (let i = iMinX; i < iMaxX; i++) {
                const numContactsBefore = result.length;
                let intersecting = false;
                // Lower triangle
                hfShape.getConvexTrianglePillar(i, j, false);
                // 把convex的offset点转换到世界空间
                Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + sphereShape.boundSphR) {
                    intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
                }

                hit = hit || intersecting;
                if (justTest && intersecting) {
                    return true;
                }

                // Upper triangle
                hfShape.getConvexTrianglePillar(i, j, true);
                Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);
                if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundSphR + sphereShape.boundSphR) {
                    intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
                }

                hit = hit || intersecting;
                if (justTest && intersecting) {
                    return true;
                }

                const numContacts = result.length - numContactsBefore;

                if (numContacts > 2) {
                    return true;
                }
                /*
                // Skip all but 1
                for (var k = 0; k < numContacts - 1; k++) {
                    result.pop();
                }
                */
            }
        }
        return hit;
    }

}

var averageNormal = new Vec3();
var averageContactPointA = new Vec3();
var averageContactPointB = new Vec3();

var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();
var tmpQuat1 = new Quaternion();
var tmpQuat2 = new Quaternion();

var Cap_Cap_tmpV1=new Vec3();

const planeTrimesh_normal = new Vec3();
const planeTrimesh_relpos = new Vec3();
const planeTrimesh_projected = new Vec3();

const sphereTrimesh_normal = new Vec3();
const sphereTrimesh_relpos = new Vec3();
//const sphereTrimesh_projected = new Vec3();
const sphereTrimesh_v = new Vec3();
const sphereTrimesh_v2 = new Vec3();
const sphereTrimesh_edgeVertexA = new Vec3();
const sphereTrimesh_edgeVertexB = new Vec3();
const sphereTrimesh_edgeVector = new Vec3();
const sphereTrimesh_edgeVectorUnit = new Vec3();
const sphereTrimesh_localSpherePos = new Vec3();
const sphereTrimesh_tmp = new Vec3();
const sphereTrimesh_va = new Vec3();
const sphereTrimesh_vb = new Vec3();
const sphereTrimesh_vc = new Vec3();
const sphereTrimesh_localSphereAABB = new AABB();
const sphereTrimesh_triangles: i32[] = [];   // i16?

const point_on_plane_to_sphere = new Vec3();
const plane_to_sphere_ortho = new Vec3();


// See http://bulletphysics.com/Bullet/BulletFull/SphereTriangleDetector_8cpp_source.html
const pointInPolygon_edge = new Vec3();
const pointInPolygon_edge_x_normal = new Vec3();
const pointInPolygon_vtp = new Vec3();
function pointInPolygon(verts: Vec3[], normal: Vec3, p: Vec3) {
    let positiveResult = null;
    const N = verts.length;
    for (let i = 0; i !== N; i++) {
        const v = verts[i];

        // Get edge to the next vertex
        const edge = pointInPolygon_edge;
        verts[(i + 1) % (N)].vsub(v, edge);

        // Get cross product between polygon normal and the edge
        const edge_x_normal = pointInPolygon_edge_x_normal;
        //var edge_x_normal = new Vec3();
        edge.cross(normal, edge_x_normal);

        // Get vector between point and current vertex
        const vertex_to_p = pointInPolygon_vtp;
        p.vsub(v, vertex_to_p);

        // This dot product determines which side of the edge the point is
        const r = edge_x_normal.dot(vertex_to_p);

        // If all such dot products have same sign, we are inside the polygon.
        if (positiveResult === null || (r > 0 && positiveResult === true) || (r <= 0 && positiveResult === false)) {
            if (positiveResult === null) {
                positiveResult = r > 0;
            }
            continue;
        } else {
            return false; // Encountered some other sign. Exit.
        }
    }

    // If we got here, all dot products were of the same sign.
    return true;
}

const box_to_sphere = new Vec3();
const sphereBox_ns = new Vec3();
const sphereBox_ns1 = new Vec3();
const sphereBox_ns2 = new Vec3();
const sphereBox_sides = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
const sphereBox_sphere_to_corner = new Vec3();
const sphereBox_side_ns = new Vec3();
const sphereBox_side_ns1 = new Vec3();
const sphereBox_side_ns2 = new Vec3();

const convex_to_sphere = new Vec3();
const sphereConvex_edge = new Vec3();
const sphereConvex_edgeUnit = new Vec3();
const sphereConvex_sphereToCorner = new Vec3();
const sphereConvex_worldCorner = new Vec3();
const sphereConvex_worldNormal = new Vec3();
const sphereConvex_worldPoint = new Vec3();
const sphereConvex_worldSpherePointClosestToPlane = new Vec3();
const sphereConvex_penetrationVec = new Vec3();
const sphereConvex_sphereToWorldPoint = new Vec3();

//const planeBox_normal = new Vec3();
//const plane_to_corner = new Vec3();

const planeConvex_v = new Vec3();
const planeConvex_normal = new Vec3();
const planeConvex_relpos = new Vec3();
const planeConvex_projected = new Vec3();

const convexConvex_sepAxis = new Vec3();
const convexConvex_q = new Vec3();

// Narrowphase.prototype[SHAPETYPE.CONVEXPOLYHEDRON | SHAPETYPE.TRIMESH] =
// Narrowphase.prototype.convexTrimesh = function(si,sj,xi,xj,qi,qj,bi,bj,rsi,rsj,faceListA,faceListB){
//     var sepAxis = convexConvex_sepAxis;

//     if(xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius){
//         return;
//     }

//     // Construct a temp hull for each triangle
//     var hullB = new ConvexPolyhedron();

//     hullB.faces = [[0,1,2]];
//     var va = new Vec3();
//     var vb = new Vec3();
//     var vc = new Vec3();
//     hullB.vertices = [
//         va,
//         vb,
//         vc
//     ];

//     for (var i = 0; i < sj.indices.length / 3; i++) {

//         var triangleNormal = new Vec3();
//         sj.getNormal(i, triangleNormal);
//         hullB.faceNormals = [triangleNormal];

//         sj.getTriangleVertices(i, va, vb, vc);

//         var d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
//         if(!d){
//             triangleNormal.scale(-1, triangleNormal);
//             d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);

//             if(!d){
//                 continue;
//             }
//         }

//         var res = [];
//         var q = convexConvex_q;
//         si.clipAgainstHull(xi,qi,hullB,xj,qj,triangleNormal,-100,100,res);
//         for(var j = 0; j !== res.length; j++){
//             var r = this.createContactEquation(bi,bj,si,sj,rsi,rsj),
//                 ri = r.ri,
//                 rj = r.rj;
//             r.ni.copy(triangleNormal);
//             r.ni.negate(r.ni);
//             res[j].normal.negate(q);
//             q.mult(res[j].depth, q);
//             res[j].point.vadd(q, ri);
//             rj.copy(res[j].point);

//             // Contact points are in world coordinates. Transform back to relative
//             ri.vsub(xi,ri);
//             rj.vsub(xj,rj);

//             // Make relative to bodies
//             ri.vadd(xi, ri);
//             ri.vsub(bi.position, ri);
//             rj.vadd(xj, rj);
//             rj.vsub(bj.position, rj);

//             result.push(r);
//         }
//     }
// };

const particlePlane_normal = new Vec3();
const particlePlane_relpos = new Vec3();
const particlePlane_projected = new Vec3();

const particleSphere_normal = new Vec3();

// WIP
const cqj = new Quaternion();
const convexParticle_local = new Vec3();
//const convexParticle_normal = new Vec3();
const convexParticle_penetratedFaceNormal = new Vec3();
const convexParticle_vertexToParticle = new Vec3();
const convexParticle_worldPenetrationVec = new Vec3();

const convexHeightfield_tmp1 = new Vec3();
const convexHeightfield_tmp2 = new Vec3();
const convexHeightfield_faceList = [0];

const sphereHeightfield_tmp1 = new Vec3();
const sphereHeightfield_tmp2 = new Vec3();

