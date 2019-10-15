import {Body} from "../objects/Body";
import {ContactEquation} from "../equations/ContactEquation";
import {Vec3} from "../math/Vec3";

test('construct',()=>{
    const bodyA = new Body();
    const bodyB = new Body();
    new ContactEquation(bodyA, bodyB);
});

test('getImpactVelocityAlongNormal',()=>{
    const bodyA = new Body();
    bodyA.position=new Vec3(1,0,0);
    bodyA.velocity=new Vec3(-10,0,0);
    const bodyB = new Body();
    bodyB.position=new Vec3(-1,0,0);
    bodyB.velocity=new Vec3(1,0,0);
    const contact = new ContactEquation(bodyA, bodyB);
    contact.ni.set(1,0,0);
    contact.ri.set(-1,0,0);
    contact.rj.set(1,0,0);
    const v = contact.getImpactVelocityAlongNormal();
    expect(v).toBe(-11);
});
