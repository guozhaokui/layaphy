export declare class Rand {
    static getFloatFromInt(v: number): number;
    static getByteFromInt(v: number): number;
    seeds: Uint32Array;
    seed: number;
    constructor(seed: number);
    getUint(): number;
    getFloat(): number;
    getSignedFloat(): number;
}
