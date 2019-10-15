import {Vec3} from "../math/Vec3";

test('creation',()=>{
    const v = new Vec3(1, 2, 3);
    expect(v.x).toBe(1);//, "Creating a vec3 should set the first parameter to the x value");
    expect(v.y).toBe(2);//, "Creating a vec3 should set the second parameter to the y value");
    expect(v.z).toBe(3);//, "Creating a vec3 should set the third parameter to the z value");

});

test('cross',()=>{
    let v = new Vec3(1, 2, 3);
    const u = new Vec3(4, 5, 6);
    v = v.cross(u);

    expect(v.x).toBe( -3);//, "Calculating cross product x");
    expect(v.y).toBe(6);//, "Calculating cross product x");
    expect(v.z).toBe(-3);//, "Calculating cross product x");
});

test('dot',()=>{
    let v = new Vec3(1, 2, 3);
    let u = new Vec3(4, 5, 6);
    let dot = v.dot(u);

    expect(dot).toBe(4 + 10 + 18);//, "Calculating dot product x");

    v = new Vec3(3, 2, 1);
    u = new Vec3(4, 5, 6);
    dot = v.dot(u);

    expect(dot).toBe(12 + 10 + 6);//, "Calculating dot product x");
});

test('set',()=>{
    const v = new Vec3(1, 2, 3);
    v.set(4, 5, 6);

    expect(v.x).toBe(4);//, "Setting values from x, y, z");
    expect(v.y).toBe(5);//, "Setting values from x, y, z");
    expect(v.z).toBe(6);//, "Setting values from x, y, z");
});

test('vadd',()=>{
    let v = new Vec3(1, 2, 3);
    const u = new Vec3(4, 5, 6);
    v = v.vadd(u);

    expect(v.x).toBe(5);//, "Adding a vector (x)");
    expect(v.y).toBe(7);//, "Adding a vector (y)");
    expect(v.z).toBe(9);//, "Adding a vector (z)");
});

test('isAntiparallelTo',()=>{
    expect(new Vec3(1, 0, 0).isAntiparallelTo(new Vec3(-1, 0, 0))).toBeTruthy();
});

test('almostEquals',()=>{
    expect(new Vec3(1, 0, 0).almostEquals(new Vec3(1, 0, 0))).toBeTruthy();
});
