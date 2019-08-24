export class SubmitKey {
    constructor() {
        this.clear();
    }
    clear() {
        this.submitType = -1;
        this.blendShader = this.other = 0;
    }
    copyFrom(src) {
        this.other = src.other;
        this.blendShader = src.blendShader;
        this.submitType = src.submitType;
    }
    copyFrom2(src, submitType, other) {
        this.other = other;
        this.submitType = submitType;
    }
    equal3_2(next, submitType, other) {
        return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;
    }
    equal4_2(next, submitType, other) {
        return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;
    }
    equal_3(next) {
        return this.submitType === next.submitType && this.blendShader === next.blendShader;
    }
    equal(next) {
        return this.other === next.other && this.submitType === next.submitType && this.blendShader === next.blendShader;
    }
}
