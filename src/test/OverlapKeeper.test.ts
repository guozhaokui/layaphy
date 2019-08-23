import OverlapKeeper from "../collision/OverlapKeeper";

test('construct', () => {
    new OverlapKeeper();
});

test('set', () => {
    const keeper = new OverlapKeeper();

    keeper.set(1, 2);
    expect(keeper.current).toEqual( [keeper.getKey(1, 2)]);

    keeper.set(3, 2);
    expect(keeper.current).toEqual([keeper.getKey(1, 2), keeper.getKey(3, 2)]);

    keeper.set(3, 1);
    expect(keeper.current).toEqual( [keeper.getKey(1, 2), keeper.getKey(1, 3), keeper.getKey(3, 2)]);
});

test('getDiff', () => {
    const keeper = new OverlapKeeper();

    keeper.set(1, 2);
    keeper.set(3, 2);
    keeper.set(3, 1);

    keeper.tick();

    keeper.set(1, 2);
    keeper.set(3, 2);
    keeper.set(3, 1);

    let additions:number[] = [];
    let removals:number[] = [];
    keeper.getDiff(additions, removals);

    expect(additions.length).toBe( 0);
    expect(removals.length).toBe(0);

    keeper.tick();

    keeper.set(1, 2);
    keeper.getDiff(additions, removals);
    expect(additions.length).toBe( 0);
    expect(removals).toEqual([1, 3, 2, 3]);

    keeper.tick();

    keeper.set(1, 2);
    keeper.set(1, 2);

    additions = [];
    removals = [];
    keeper.getDiff(additions, removals);
    expect(additions.length).toBe(0);//, 0, 'should handle duplicate entries');
    expect(removals.length).toBe(0);//, 0, 'should handle duplicate entries');

    keeper.set(3, 2);
    keeper.set(3, 1);
    additions = [];
    removals = [];
    keeper.getDiff(additions, removals);
    expect(additions).toEqual( [1, 3, 2, 3]);

    keeper.tick();

    keeper.set(4, 2);
    keeper.set(4, 1);

    additions = [];
    removals = [];
    keeper.getDiff(additions, removals);
    expect(additions).toEqual( [1, 4, 2, 4]);
    expect(removals).toEqual([1, 2, 1, 3, 2, 3]);

});