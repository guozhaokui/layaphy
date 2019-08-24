import { Mesh2D } from "./Mesh2D";
export class MeshQuadTexture extends Mesh2D {
    constructor() {
        super(MeshQuadTexture.const_stride, 4, 4);
        this.canReuse = true;
        this.setAttributes(MeshQuadTexture._fixattriInfo);
        if (!MeshQuadTexture._fixib) {
            this.createQuadIB(MeshQuadTexture._maxIB);
            MeshQuadTexture._fixib = this._ib;
        }
        else {
            this._ib = MeshQuadTexture._fixib;
            this._quadNum = MeshQuadTexture._maxIB;
        }
    }
    static __int__() {
        MeshQuadTexture._fixattriInfo = [5126, 4, 0,
            5121, 4, 16,
            5121, 4, 20];
    }
    static getAMesh(mainctx) {
        var ret = null;
        if (MeshQuadTexture._POOL.length) {
            ret = MeshQuadTexture._POOL.pop();
        }
        else
            ret = new MeshQuadTexture();
        mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshQuadTexture.const_stride, false);
        return ret;
    }
    releaseMesh() {
        this._vb.setByteLength(0);
        this.vertNum = 0;
        this.indexNum = 0;
        MeshQuadTexture._POOL.push(this);
    }
    destroy() {
        this._vb.destroy();
        this._vb.deleteBuffer();
    }
    addQuad(pos, uv, color, useTex) {
        var vb = this._vb;
        var vpos = (vb._byteLength >> 2);
        vb.setByteLength((vpos + MeshQuadTexture.const_stride) << 2);
        var vbdata = vb._floatArray32 || vb.getFloat32Array();
        var vbu32Arr = vb._uint32Array;
        var cpos = vpos;
        var useTexVal = useTex ? 0xff : 0;
        vbdata[cpos++] = pos[0];
        vbdata[cpos++] = pos[1];
        vbdata[cpos++] = uv[0];
        vbdata[cpos++] = uv[1];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[2];
        vbdata[cpos++] = pos[3];
        vbdata[cpos++] = uv[2];
        vbdata[cpos++] = uv[3];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[4];
        vbdata[cpos++] = pos[5];
        vbdata[cpos++] = uv[4];
        vbdata[cpos++] = uv[5];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[6];
        vbdata[cpos++] = pos[7];
        vbdata[cpos++] = uv[6];
        vbdata[cpos++] = uv[7];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vb._upload = true;
    }
}
MeshQuadTexture.const_stride = 24;
MeshQuadTexture._maxIB = 16 * 1024;
MeshQuadTexture._POOL = [];
