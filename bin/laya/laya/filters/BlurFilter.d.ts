import { Filter } from "./Filter";
export declare class BlurFilter extends Filter {
    strength: number;
    strength_sig2_2sig2_gauss1: any[];
    strength_sig2_native: Float32Array;
    renderFunc: any;
    constructor(strength?: number);
    readonly type: number;
    getStrenth_sig2_2sig2_native(): Float32Array;
}
