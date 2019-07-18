export class CommandEncoder {
    constructor(layagl, reserveSize, adjustSize, isSyncToRenderThread) {
        this._idata = [];
    }
    getArrayData() {
        return this._idata;
    }
    getPtrID() {
        return 0;
    }
    beginEncoding() {
    }
    endEncoding() {
    }
    clearEncoding() {
        this._idata.length = 0;
    }
    getCount() {
        return this._idata.length;
    }
    add_ShaderValue(o) {
        this._idata.push(o);
    }
    addShaderUniform(one) {
        this.add_ShaderValue(one);
    }
}
