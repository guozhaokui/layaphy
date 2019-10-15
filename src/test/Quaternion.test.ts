import {Quaternion} from "../math/Quaternion";
import {Vec3} from "../math/Vec3";

test('creation', () => {
    const q = new Quaternion(1, 2, 3, 4);
    expect(q.x).toBe(1);//, "Creating should set the first parameter to the x value");
    expect(q.y).toBe(2);//, "Creating should set the second parameter to the y value");
    expect(q.z).toBe(3);//, "Creating should set the third parameter to the z value");
    expect(q.w).toBe(4);//, "Creating should set the third parameter to the z value");
});

test('conjugate', () => {
    const q = new Quaternion(1, 2, 3, 4);
    q.conjugate(q);
    expect(q.x).toBe(-1);//, ".conjugate() should negate x");
    expect(q.y).toBe(-2);//, ".conjugate() should negate y");
    expect(q.z).toBe(-3);//, ".conjugate() should negate z");
    expect(q.w).toBe( 4);//, ".conjugate() should not touch w");
});

test('inverse', () => {
    const q = new Quaternion(1, 2, 3, 4);
    const denominator = 1 * 1 + 2 * 2 + 3 * 3 + 4 * 4;
    q.inverse(q);

    // Quaternion inverse is conj(q) / ||q||^2
    expect(q.x).toBe(-1/ denominator);//, ".inverse() should negate x and divide by length^2");
    expect(q.y).toBe(-2 / denominator);//, ".inverse() should negate y and divide by length^2");
    expect(q.z).toBe(-3 / denominator);//, ".inverse() should negate z and divide by length^2");
    expect(q.w).toBe( 4 / denominator);//, ".inverse() should divide by length^2");

});

test('toEuler', () => {
    const q = new Quaternion();
    q.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 4);
    const euler = new Vec3();
    q.toEuler(euler);

    console.log('euler=', euler);
    // we should expect (0,0,pi/4)
    expect(euler.x).toBe( 0);//, `euler x should be zero, got ${euler.x}`);
    expect(euler.y).toBe( 0);//, `euler y should be yero, got ${euler.y}`);
    expect(Math.abs(euler.z - Math.PI / 4) < 0.001).toBeTruthy();//, `euler z should be ${Math.PI / 4}); got ${euler.z}`);
});

test('setFromVectors', () => {
    const q = new Quaternion();
    q.setFromVectors(new Vec3(1, 0, 0), new Vec3(-1, 0, 0));
    expect(q.vmult(new Vec3(1, 0, 0)).almostEquals(new Vec3(-1, 0, 0))).toBeTruthy();

    q.setFromVectors(new Vec3(0, 1, 0), new Vec3(0, -1, 0));
    expect(q.vmult(new Vec3(0, 1, 0)).almostEquals(new Vec3(0, -1, 0))).toBeTruthy();

    q.setFromVectors(new Vec3(0, 0, 1), new Vec3(0, 0, -1));
    expect(q.vmult(new Vec3(0, 0, 1)).almostEquals(new Vec3(0, 0, -1))).toBeTruthy();
});

test('slerp', () => {
    const qa = new Quaternion();
    const qb = new Quaternion();
    qa.slerp(qb, 0.5, qb);
    expect(qa).toEqual( qb);

    qa.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 4);
    qb.setFromAxisAngle(new Vec3(0, 0, 1), -Math.PI / 4);
    qa.slerp(qb, 0.5, qb);
    expect(qb).toEqual(new Quaternion());
});
