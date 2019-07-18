export class RandX {
    constructor(seed) {
        if (!(seed instanceof Array) || seed.length !== 4)
            throw new Error('Rand:Seed must be an array with 4 numbers');
        this._state0U = seed[0] | 0;
        this._state0L = seed[1] | 0;
        this._state1U = seed[2] | 0;
        this._state1L = seed[3] | 0;
    }
    randomint() {
        var s1U = this._state0U, s1L = this._state0L;
        var s0U = this._state1U, s0L = this._state1L;
        var sumL = (s0L >>> 0) + (s1L >>> 0);
        var resU = (s0U + s1U + (sumL / 2 >>> 31)) >>> 0;
        var resL = sumL >>> 0;
        this._state0U = s0U;
        this._state0L = s0L;
        var t1U = 0, t1L = 0;
        var t2U = 0, t2L = 0;
        var a1 = 23;
        var m1 = 0xFFFFFFFF << (32 - a1);
        t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
        t1L = s1L << a1;
        s1U = s1U ^ t1U;
        s1L = s1L ^ t1L;
        t1U = s1U ^ s0U;
        t1L = s1L ^ s0L;
        var a2 = 18;
        var m2 = 0xFFFFFFFF >>> (32 - a2);
        t2U = s1U >>> a2;
        t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        var a3 = 5;
        var m3 = 0xFFFFFFFF >>> (32 - a3);
        t2U = s0U >>> a3;
        t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        this._state1U = t1U;
        this._state1L = t1L;
        return [resU, resL];
    }
    random() {
        var t2 = this.randomint();
        var t2U = t2[0];
        var t2L = t2[1];
        var eU = 0x3FF << (52 - 32);
        var eL = 0;
        var a1 = 12;
        var m1 = 0xFFFFFFFF >>> (32 - a1);
        var sU = t2U >>> a1;
        var sL = (t2L >>> a1) | ((t2U & m1) << (32 - a1));
        var xU = eU | sU;
        var xL = eL | sL;
        RandX._CONVERTION_BUFFER.setUint32(0, xU, false);
        RandX._CONVERTION_BUFFER.setUint32(4, xL, false);
        var d = RandX._CONVERTION_BUFFER.getFloat64(0, false);
        return d - 1;
    }
}
RandX._CONVERTION_BUFFER = new DataView(new ArrayBuffer(8));
RandX.defaultRand = new RandX([0, Date.now() / 65536, 0, Date.now() % 65536]);
