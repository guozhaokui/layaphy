import { Filter } from "./Filter";
import { BlurFilterGLRender } from "./BlurFilterGLRender";
export class BlurFilter extends Filter {
    constructor(strength = 4) {
        super();
        this.strength_sig2_2sig2_gauss1 = [];
        this.strength = strength;
        this._glRender = new BlurFilterGLRender();
    }
    get type() {
        return Filter.BLUR;
    }
    getStrenth_sig2_2sig2_native() {
        if (!this.strength_sig2_native) {
            this.strength_sig2_native = new Float32Array(4);
        }
        var sigma = this.strength / 3.0;
        var sigma2 = sigma * sigma;
        this.strength_sig2_native[0] = this.strength;
        this.strength_sig2_native[1] = sigma2;
        this.strength_sig2_native[2] = 2.0 * sigma2;
        this.strength_sig2_native[3] = 1.0 / (2.0 * Math.PI * sigma2);
        return this.strength_sig2_native;
    }
}
