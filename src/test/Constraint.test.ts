import {Body} from "../objects/Body";
import {Constraint} from "../constraints/Constraint";
import {Equation} from "../equations/Equation";

test('construct', () => {
    const bodyA = new Body();
    const bodyB = new Body();
    new Constraint(bodyA, bodyB,true);
});

test('enable', () => {
    const bodyA = new Body();
    const bodyB = new Body();
    const c = new Constraint(bodyA, bodyB,true);
    const eq = new Equation(bodyA, bodyB);
    c.equations.push(eq);

    c.enable();
    expect(eq.enabled).toBeTruthy();

    c.disable();
    expect(!eq.enabled).toBeTruthy();
});

