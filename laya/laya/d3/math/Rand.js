export class Rand {
    constructor(seed) {
        this._temp = new Uint32Array(1);
        this.seeds = new Uint32Array(4);
        this.seeds[0] = seed;
        this.seeds[1] = this.seeds[0] * 0x6C078965 + 1;
        this.seeds[2] = this.seeds[1] * 0x6C078965 + 1;
        this.seeds[3] = this.seeds[2] * 0x6C078965 + 1;
    }
    static getFloatFromInt(v) {
        return (v & 0x007FFFFF) * (1.0 / 8388607.0);
    }
    static getByteFromInt(v) {
        return (v & 0x007FFFFF) >>> 15;
    }
    get seed() {
        return this.seeds[0];
    }
    set seed(seed) {
        this.seeds[0] = seed;
        this.seeds[1] = this.seeds[0] * 0x6C078965 + 1;
        this.seeds[2] = this.seeds[1] * 0x6C078965 + 1;
        this.seeds[3] = this.seeds[2] * 0x6C078965 + 1;
    }
    getUint() {
        this._temp[0] = this.seeds[0] ^ (this.seeds[0] << 11);
        this.seeds[0] = this.seeds[1];
        this.seeds[1] = this.seeds[2];
        this.seeds[2] = this.seeds[3];
        this.seeds[3] = (this.seeds[3] ^ (this.seeds[3] >>> 19)) ^ (this._temp[0] ^ (this._temp[0] >>> 8));
        return this.seeds[3];
    }
    getFloat() {
        this.getUint();
        return (this.seeds[3] & 0x007FFFFF) * (1.0 / 8388607.0);
    }
    getSignedFloat() {
        return this.getFloat() * 2.0 - 1.0;
    }
}
