import TupleDictionary from "../utils/TupleDictionary";

test('set', ()=> {
    const t = new TupleDictionary();

    t.set(1,2,'lol');
    expect(t.data['1-2']).toBe('lol');

    t.set(2,1,'lol2');
    expect(t.data['1-2']).toBe('lol2');
});

test('get', ()=>{
    const t = new TupleDictionary();

    t.set(1,2,'1');
    t.set(3,2,'2');

    expect(t.data['1-2']).toBe(t.get(1,2));
    expect(t.data['1-2']).toBe(t.get(2,1));

    expect(t.data['2-3']).toBe(t.get(2,3));
    expect(t.data['2-3']).toBe(t.get(3,2));
});

test('reset', ()=> {
    const t = new TupleDictionary();
    const empty = new TupleDictionary();

    t.reset();
    t.set(1,2,'1');
    t.reset();
    expect(t.data).toEqual(empty.data);
});
