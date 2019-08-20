import Equation from './Equation.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';
import Shape from '../shapes/Shape.js';

/**
 * Contact/non-penetration constraint equation
 * @author schteppe
 * TODO 复用
 */
export default class ContactEquation extends Equation {
    // 补偿值。保持一定距离，
    restitution = 0.0; // "bounciness": u1 = -e*u0

    /**
     * World-oriented vector that goes from the center of bi to the contact point.
     * 从bi中心指向碰撞点的向量。世界空间。
     */
    ri = new Vec3();

    /**
     * World-oriented vector that starts in body j position and goes to the contact point.
     * 从bj中心指向碰撞点的向量。世界空间。
     */
    rj = new Vec3();

    /**
     * Contact normal, pointing out of body i.
     * 指向第一个对象的外面的碰撞法线
     */
    ni = new Vec3();

    si:Shape;
    sj:Shape;
    
    constructor(bodyA: Body, bodyB: Body, maxForce = 1e6) {
        super(bodyA, bodyB, 0, maxForce);

    }

    private static rixn = new Vec3();
    private static rjxn = new Vec3();
    private static temp3 = new Vec3();
    computeB(h:number) {
        const a = this.a;
        const b = this.b;
        const bi = this.bi;
        const bj = this.bj;
        const ri = this.ri;
        const rj = this.rj;
        const rixn = ContactEquation.rixn;
        const rjxn = ContactEquation.rjxn;
        const vi = bi.velocity;
        const wi = bi.angularVelocity;
        const vj = bj.velocity;
        const wj = bj.angularVelocity;
        const penetrationVec = ContactEquation.temp3;
        const GA = this.jacobianElementA;
        const GB = this.jacobianElementB;
        const n = this.ni;

        // Caluclate cross products
        ri.cross(n, rixn); // rixn = ri X n
        rj.cross(n, rjxn); // rjxn = rj X n

        // g = xj+rj -(xi+ri)
        // G = [ -ni  -rixn  ni  rjxn ]
        n.negate(GA.spatial);       //GA.s = -n
        rixn.negate(GA.rotational); //GA.r = -rixn
        GB.spatial.copy(n);         //GB.s = n
        GB.rotational.copy(rjxn);   //GB.r = rjxn

        // Calculate the penetration vector
        // 计算插入深度，实际就是两个碰撞点的距离
        penetrationVec.copy(bj.position);
        penetrationVec.vadd(rj, penetrationVec);            // posj+rj
        penetrationVec.vsub(bi.position, penetrationVec);   // 
        penetrationVec.vsub(ri, penetrationVec);            // posi+ri - (posj+rj)
        // g 是约束函数.这里是约束函数的值。希望这个值>=0, <0表示插入了
        const g = n.dot(penetrationVec);                    // .n

        // Compute iteration
        const ePlusOne = this.restitution + 1;
        const GW = ePlusOne * (vj.dot(n) -  vi.dot(n)) + wj.dot(rjxn) - wi.dot(rixn); // = dg/dt 去掉第二部分，约等于这个
        const GiMf = this.computeGiMf();

        const B = - g * a - GW * b - h * GiMf;  //? TODO 为什么是 ga, g=Gq么。 Gq的计算没有考虑旋转部分，所以确实相等，这里需要继续理解
        return B;
    }

    private static _vi = new Vec3();
    private static _vj = new Vec3();
    private static _xi = new Vec3();
    private static _xj = new Vec3();
    private static _relVel=new Vec3();
    /**
     * Get the current relative velocity in the contact point.
     * 计算相撞在法线方向的速度的力量 dot(relv, normal) ,相对于i
     */
    getImpactVelocityAlongNormal() {
        const vi = ContactEquation._vi;
        const vj = ContactEquation._vj;
        const xi = ContactEquation._xi;
        const xj = ContactEquation._xj;
        const relVel = ContactEquation._relVel;

        this.bi.position.vadd(this.ri, xi); // xi = bi.pos + this.ri
        this.bj.position.vadd(this.rj, xj); // xj = bj.pos + this.rj

        // xi和xj难道不在一个点上么
        this.bi.getVelocityAtWorldPoint(xi, vi);
        this.bj.getVelocityAtWorldPoint(xj, vj);

        vi.vsub(vj, relVel);    // relVel = vi-vj

        return this.ni.dot(relVel);
    }
}

