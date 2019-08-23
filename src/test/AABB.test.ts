import AABB from "../collision/AABB";
import Vec3 from "../math/Vec3";
import Transform from "../math/Transform";

test('construct', () => {
    new AABB();
});

test('copy', () => {
    const a = new AABB();
    const b = new AABB();
    a.upperBound.set(1, 2, 3);
    b.copy(a);
    expect(a).toEqual(b);
});

test('clone', () => {
    const a = new AABB(new Vec3(-1, -2, -3), new Vec3(1, 2, 3));
    const b = a.clone();
    expect(a).toEqual(b);
    expect(a === b).toBeFalsy();
});

test('extend', () => {
    let a = new AABB(new Vec3(-1, -1, -1),new Vec3(1, 1, 1));
    let b = new AABB(new Vec3(-2, -2, -2),new Vec3(2, 2, 2));
    a.extend(b);
    expect(a).toEqual(b);

    a = new AABB(new Vec3(-1, -1, -1),new Vec3(1, 1, 1));
    b = new AABB(new Vec3(-2, -2, -2),new Vec3(2, 2, 2));
    b.extend(a);
    expect(b.lowerBound).toEqual(new Vec3(-2, -2, -2));
    expect(b.upperBound).toEqual(new Vec3(2, 2, 2));

    a = new AABB(new Vec3(-2, -1, -1),new Vec3(2, 1, 1));
    b = new AABB(new Vec3(-1, -1, -1),new Vec3(1, 1, 1));
    b.extend(a);
    expect(a.lowerBound).toEqual(new Vec3(-2, -1, -1));
    expect(a.upperBound).toEqual(new Vec3(2, 1, 1));
});

test('overlaps', () => {
    const a = new AABB();
    const b = new AABB();

    // Same aabb
    a.lowerBound.set(-1, -1, 0);
    a.upperBound.set(1, 1, 0);
    b.lowerBound.set(-1, -1, 0);
    b.upperBound.set(1, 1, 0);
    expect(a.overlaps(b)).toBeTruthy();//, 'should detect overlap');

    // Corner overlaps
    b.lowerBound.set(1, 1, 0);
    b.upperBound.set(2, 2, 0);
    expect(a.overlaps(b)).toBeTruthy();//, 'should detect corner overlap');

    // Separate
    b.lowerBound.set(1.1, 1.1, 0);
    expect(!a.overlaps(b)).toBeTruthy();//, 'should detect separated');

    // fully inside
    b.lowerBound.set(-0.5, -0.5, 0);
    b.upperBound.set(0.5, 0.5, 0);
    expect(a.overlaps(b)).toBeTruthy();//, 'should detect if aabb is fully inside other aabb');
    b.lowerBound.set(-1.5, -1.5, 0);
    b.upperBound.set(1.5, 1.5, 0);
    expect(a.overlaps(b)).toBeTruthy();//, 'should detect if aabb is fully inside other aabb');

    // Translated
    b.lowerBound.set(-3, -0.5, 0);
    b.upperBound.set(-2, 0.5, 0);
    expect(!a.overlaps(b)).toBeTruthy();//, 'should detect translated');
});

test('contains', () => {
    const a = new AABB();
    const b = new AABB();

    a.lowerBound.set(-1, -1, -1);
    a.upperBound.set(1, 1, 1);
    b.lowerBound.set(-1, -1, -1);
    b.upperBound.set(1, 1, 1);

    expect(a.contains(b)).toBeTruthy();

    a.lowerBound.set(-2, -2, -2);
    a.upperBound.set(2, 2, 2);

    expect(a.contains(b)).toBeTruthy();

    b.lowerBound.set(-3, -3, -3);
    b.upperBound.set(3, 3, 3);

    expect(a.contains(b)).toBeFalsy();

    a.lowerBound.set(0, 0, 0);
    a.upperBound.set(2, 2, 2);
    b.lowerBound.set(-1, -1, -1);
    b.upperBound.set(1, 1, 1);

    expect(a.contains(b)).toBeFalsy()
});

test('toLocalFrame', () => {
    const worldAABB = new AABB();
    const localAABB = new AABB();
    const frame = new Transform();

    worldAABB.lowerBound.set(-1, -1, -1);
    worldAABB.upperBound.set(1, 1, 1);

    // No transform - should stay the same
    worldAABB.toLocalFrame(frame, localAABB);
    expect(localAABB).toEqual(worldAABB);

    // Some translation
    frame.position.set(-1, 0, 0);
    worldAABB.toLocalFrame(frame, localAABB);
    expect(localAABB).toEqual(new AABB(new Vec3(0, -1, -1),new Vec3(2, 1, 1))
    );
});

test('toWorldFrame', () => {
    const localAABB = new AABB();
    const worldAABB = new AABB();
    const frame = new Transform();

    localAABB.lowerBound.set(-1, -1, -1);
    localAABB.upperBound.set(1, 1, 1);

    // No transform - should stay the same
    localAABB.toLocalFrame(frame, worldAABB);
    expect(localAABB).toEqual( worldAABB);

    // Some translation on the frame
    frame.position.set(1, 0, 0);
    localAABB.toWorldFrame(frame, worldAABB);
    expect(worldAABB).toEqual(new AABB(new Vec3(0, -1, -1),new Vec3(2, 1, 1))
    );
});

