import Body from "../objects/Body";
import Vec3 from "../math/Vec3";
import HingeConstraint from "../constraints/HingeConstraint";

test('construct', () => {
    const bodyA = new Body( 1);
    bodyA.position=new Vec3(1,0,0);
    const bodyB = new Body( 1);
    bodyB.position=new Vec3(-1,0,0);
    const c = new HingeConstraint(bodyA, bodyB,123 );

    expect(c.equations.length).toBe(6); // 5 actually, and 1 for the motor

    expect(c.equations[0].maxForce).toBe(123);
    expect(c.equations[1].maxForce).toBe(123);
    expect(c.equations[2].maxForce).toBe(123);
    expect(c.equations[3].maxForce).toBe(123);
    expect(c.equations[4].maxForce).toBe(123);
    expect(c.equations[5].maxForce).toBe(123);

    expect(c.equations[0].minForce).toBe(-123);
    expect(c.equations[1].minForce).toBe(-123);
    expect(c.equations[2].minForce).toBe(-123);
    expect(c.equations[3].minForce).toBe(-123);
    expect(c.equations[4].minForce).toBe(-123);
    expect(c.equations[5].minForce).toBe(-123);
});

test('update', () => {
    const bodyA = new Body(1,null, new Vec3(1, 0, 0) );
    const bodyB = new Body(1,null,  new Vec3(-1, 0, 0) );
    const c = new HingeConstraint(bodyA, bodyB, 123 );
    c.update();
});

test('enableDisableMotor', () => {
    const bodyA = new Body( 1, null,  new Vec3(1, 0, 0) );
    const bodyB = new Body( 1, null, new Vec3(-1, 0, 0) );
    const c = new HingeConstraint(bodyA, bodyB);

    c.enableMotor();

    expect(c.motorEquation.enabled).toBeTruthy();

    c.disableMotor();

    expect(c.motorEquation.enabled).toBeFalsy();
});

test('setMotorSpeed', () => {
    const bodyA = new Body( 1,null, new Vec3(1, 0, 0) );
    const bodyB = new Body(1, null, new Vec3(-1, 0, 0) );
    const c = new HingeConstraint(bodyA, bodyB);

    c.setMotorSpeed(5);
    expect(c.motorEquation.targetVelocity).toBe(5);
});

test('setMotorMaxForce', () => {
    const bodyA = new Body(1, null, new Vec3(1, 0, 0) );
    const bodyB = new Body(1, null, new Vec3(-1, 0, 0));
    const c = new HingeConstraint(bodyA, bodyB);

    c.setMotorMaxForce(100);
    expect(c.motorEquation.maxForce).toBe(100);
});


