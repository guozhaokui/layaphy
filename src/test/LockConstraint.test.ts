import Body from "../objects/Body";
import LockConstraint from "../constraints/LockConstraint";
import Vec3 from "../math/Vec3";

test('construct', () => {
    const bodyA = new Body(1, null, new Vec3(1, 0, 0));
    const bodyB = new Body(1, null, new Vec3(-1, 0, 0));
    const c = new LockConstraint(bodyA, bodyB, 123);

    expect(c.equations.length).toBe(6);

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
    const bodyA = new Body(1, null, new Vec3(1, 0, 0));
    const bodyB = new Body(1, null, new Vec3(-1, 0, 0));
    const c = new LockConstraint(bodyA, bodyB, 123);

    c.update();
});

