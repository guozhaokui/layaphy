import Heightfield from "../shapes/Heightfield";
import Vec3 from "../math/Vec3";
import Quaternion from "../math/Quaternion";

test('calculateWorldAABB', () => {
    const hfShape = createHeightfield({
        minValue: 0
    });
    const min = new Vec3();
    const max = new Vec3();
    hfShape.calculateWorldAABB(
        new Vec3(),
        new Quaternion(),
        min,
        max
    );

    expect(min.x).toBe(-Number.MAX_VALUE);
    expect(max.x).toBe(Number.MAX_VALUE);
    expect(min.y).toBe(-Number.MAX_VALUE);
    expect(max.y).toBe( Number.MAX_VALUE);
});

test('getConvexTrianglePillar', () => {
    const hfShape = createHeightfield({
        minValue: 0,
        size: 2
    });

    hfShape.getConvexTrianglePillar(0, 0, false);
    expect(hfShape.pillarConvex.vertices.length).toBe(6);
    expect(hfShape.pillarConvex.vertices.slice(0, 3)).toEqual( [
        new Vec3(-0.25, -0.25, 0.5),
        new Vec3(0.75, -0.25, 0.5),
        new Vec3(-0.25, 0.75, 0.5)
    ]);
    expect(hfShape.pillarOffset).toEqual( new Vec3(0.25, 0.25, 0.5));

    hfShape.getConvexTrianglePillar(0, 0, true);
    expect(hfShape.pillarConvex.vertices.length).toBe(6);
    expect(hfShape.pillarConvex.vertices.slice(0, 3)).toEqual( [
        new Vec3(0.25, 0.25, 0.5),
        new Vec3(-0.75, 0.25, 0.5),
        new Vec3(0.25, -0.75, 0.5)
    ]);
    expect(hfShape.pillarOffset).toEqual( new Vec3(0.75, 0.75, 0.5));

    // Out of bounds
    expect(() => {
        hfShape.getConvexTrianglePillar(1, 1, true);
    }).toThrow();
    expect(() => {
        hfShape.getConvexTrianglePillar(1, 1, false);
    }).toThrow();
    expect(() => {
        hfShape.getConvexTrianglePillar(-1, 0, false);
    }).toThrow();
});

test('getTriangle', () => {
    const hfShape = createHeightfield({
        minValue: 0,
        size: 2
    });
    const a = new Vec3();
    const b = new Vec3();
    const c = new Vec3();

    hfShape.getTriangle(0, 0, false, a, b, c);
    expect(a).toEqual( new Vec3(0, 0, 1));
    expect(b).toEqual( new Vec3(1, 0, 1));
    expect(c).toEqual( new Vec3(0, 1, 1));

    hfShape.getTriangle(0, 0, true, a, b, c);
    expect(a).toEqual( new Vec3(1, 1, 1));
    expect(b).toEqual( new Vec3(0, 1, 1));
    expect(c).toEqual( new Vec3(1, 0, 1));

});

test('getRectMinMax', () => {
    const hfShape = createHeightfield();
    const minMax:number[] = [];
    hfShape.getRectMinMax(0, 0, 1, 1, minMax);
    expect(minMax).toEqual( [1, 1]);
});

test('getHeightAt', () => {
    const hfShape = createHeightfield({
        size: 2,
        linear: true
    });
    console.warn('add more tests here');
    const h0 = hfShape.getHeightAt(0, 0,false);
    const h1 = hfShape.getHeightAt(0.25, 0.25,false);
    const h2 = hfShape.getHeightAt(0.75, 0.75,false);
    const h3 = hfShape.getHeightAt(0.99, 0.99,false);

    expect(h0).toBe(0);
    expect(h0 < h1).toBeTruthy();
    expect(h1 < h2).toBeTruthy();
    expect(h2 < h3).toBeTruthy();
});

test('update', () => {
    const hfShape = createHeightfield();
    hfShape.update();
});

test('updateMaxValue', () => {
    const hfShape = createHeightfield();
    hfShape.data[0][0] = 10;
    hfShape.updateMaxValue();
    expect(hfShape.maxValue).toBe(10);
});

test('updateMinValue', () => {
    const hfShape = createHeightfield();
    hfShape.data[0][0] = -10;
    hfShape.updateMinValue();
    expect(hfShape.minValue).toBe( -10);
});

test('setHeightValueAtIndex', () => {
    const hfShape = createHeightfield();
    hfShape.setHeightValueAtIndex(0, 0, 10);
    expect(hfShape.data[0][0]).toBe( 10);
});

test('getIndexOfPosition', () => {
    const hfShape = createHeightfield();
    const result:number[] = [];
    hfShape.getIndexOfPosition(0, 0, result,false);
    expect(result).toEqual( [0, 0]);
});

/**
 * 
 * @param options {size:边的格子个数，总数为 size*size}
 */
function createHeightfield(options:{size?:number,linear?:boolean,minValue?:number} = {}) {
    const matrix:number[][] = [];
    const size = options.size || 20;
    for (let i = 0; i < size; i++) {
        matrix.push([]);
        for (let j = 0; j < size; j++) {
            if (options.linear) {
                matrix[i].push(i + j);
            } else {
                matrix[i].push(1);
            }
        }
    }
    const hfShape = new Heightfield(matrix, options.minValue,null,1);
    return hfShape;
}