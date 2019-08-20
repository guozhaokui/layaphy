import Vec3 from '../math/Vec3.js';
import Body from './Body.js';

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restLength]   A number > 0. Default: 1
 * @param {number} [options.stiffness]    A number >= 0. Default: 100
 * @param {number} [options.damping]      A number >= 0. Default: 1
 * @param {Vec3}  [options.worldAnchorA] Where to hook the spring to body A, in world coordinates.
 * @param {Vec3}  [options.worldAnchorB]
 * @param {Vec3}  [options.localAnchorA] Where to hook the spring to body A, in local body coordinates.
 * @param {Vec3}  [options.localAnchorB]
 */
export default class Spring {
    /**
     * Rest length of the spring.
     */
    restLength = 1;

    /**
     * Stiffness of the spring.
     */
    stiffness = 100;

    /**
     * Damping of the spring.
     */
    damping = 1;

    /**
     * First connected body.
     */
    bodyA: Body;

    /**
     * Second connected body.
     */
    bodyB: Body;

    /**
     * Anchor for bodyA in local bodyA coordinates.
     */
    localAnchorA = new Vec3();

    /**
     * Anchor for bodyB in local bodyB coordinates.
     */
    localAnchorB = new Vec3();


    constructor(bodyA: Body, bodyB: Body, options: any = {}) {
        this.restLength = typeof (options.restLength) === "number" ? options.restLength : 1;

        this.stiffness = options.stiffness || 100;

        this.damping = options.damping || 1;

        this.bodyA = bodyA;

        this.bodyB = bodyB;


        if (options.localAnchorA) {
            this.localAnchorA.copy(options.localAnchorA);
        }
        if (options.localAnchorB) {
            this.localAnchorB.copy(options.localAnchorB);
        }
        if (options.worldAnchorA) {
            this.setWorldAnchorA(options.worldAnchorA);
        }
        if (options.worldAnchorB) {
            this.setWorldAnchorB(options.worldAnchorB);
        }
    }

    /**
     * Set the anchor point on body A, using world coordinates.
     * @method setWorldAnchorA
     * @param {Vec3} worldAnchorA
     */
    setWorldAnchorA(worldAnchorA) {
        this.bodyA.pointToLocalFrame(worldAnchorA, this.localAnchorA);
    }

    /**
     * Set the anchor point on body B, using world coordinates.
     */
    setWorldAnchorB(worldAnchorB:Vec3) {
        this.bodyB.pointToLocalFrame(worldAnchorB, this.localAnchorB);
    }

    /**
     * Get the anchor point on body A, in world coordinates.
     * @param  result The vector to store the result in.
     */
    getWorldAnchorA(result:Vec3) {
        this.bodyA.pointToWorldFrame(this.localAnchorA, result);
    }

    /**
     * Get the anchor point on body B, in world coordinates.
     * @param  result The vector to store the result in.
     */
    getWorldAnchorB(result:Vec3) {
        this.bodyB.pointToWorldFrame(this.localAnchorB, result);
    }

    /**
     * Apply the spring force to the connected bodies.
     */
    applyForce() {
        const k = this.stiffness;
        const d = this.damping;
        const l = this.restLength;
        const bodyA = this.bodyA;
        const bodyB = this.bodyB;
        const r = applyForce_r;
        const r_unit = applyForce_r_unit;
        const u = applyForce_u;
        const f = applyForce_f;
        const tmp = applyForce_tmp;
        const worldAnchorA = applyForce_worldAnchorA;
        const worldAnchorB = applyForce_worldAnchorB;
        const ri = applyForce_ri;
        const rj = applyForce_rj;
        const ri_x_f = applyForce_ri_x_f;
        const rj_x_f = applyForce_rj_x_f;

        // Get world anchors
        this.getWorldAnchorA(worldAnchorA);
        this.getWorldAnchorB(worldAnchorB);

        // Get offset points
        worldAnchorA.vsub(bodyA.position, ri);
        worldAnchorB.vsub(bodyB.position, rj);

        // Compute distance vector between world anchor points
        worldAnchorB.vsub(worldAnchorA, r);
        const rlen = r.length();
        r_unit.copy(r);
        r_unit.normalize();

        // Compute relative velocity of the anchor points, u
        bodyB.velocity.vsub(bodyA.velocity, u);
        // Add rotational velocity

        bodyB.angularVelocity.cross(rj, tmp);
        u.vadd(tmp, u);
        bodyA.angularVelocity.cross(ri, tmp);
        u.vsub(tmp, u);

        // F = - k * ( x - L ) - D * ( u )
        r_unit.scale(-k * (rlen - l) - d * u.dot(r_unit), f);

        // Add forces to bodies
        bodyA.force.vsub(f, bodyA.force);
        bodyB.force.vadd(f, bodyB.force);

        // Angular force
        ri.cross(f, ri_x_f);
        rj.cross(f, rj_x_f);
        bodyA.torque.vsub(ri_x_f, bodyA.torque);
        bodyB.torque.vadd(rj_x_f, bodyB.torque);
    }
}

var applyForce_r = new Vec3();
var applyForce_r_unit = new Vec3();
var applyForce_u = new Vec3();
var applyForce_f = new Vec3();
var applyForce_worldAnchorA = new Vec3();
var applyForce_worldAnchorB = new Vec3();
var applyForce_ri = new Vec3();
var applyForce_rj = new Vec3();
var applyForce_ri_x_f = new Vec3();
var applyForce_rj_x_f = new Vec3();
var applyForce_tmp = new Vec3();
