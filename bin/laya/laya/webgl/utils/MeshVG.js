import { Mesh2D } from "./Mesh2D";
import { LayaGL } from "../../layagl/LayaGL";
export class MeshVG extends Mesh2D {
    constructor() {
        super(MeshVG.const_stride, 4, 4);
        this.canReuse = true;
        this.setAttributes(MeshVG._fixattriInfo);
    }
    static __init__() {
        var gl = LayaGL.instance;
        MeshVG._fixattriInfo = [5126, 2, 0,
            5121, 4, 8];
    }
    static getAMesh(mainctx) {
        var ret;
        if (MeshVG._POOL.length) {
            ret = MeshVG._POOL.pop();
        }
        else
            ret = new MeshVG();
        mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshVG.const_stride, false);
        return ret;
    }
    addVertAndIBToMesh(ctx, points, rgba, ib) {
        var startpos = this._vb.needSize(points.length / 2 * MeshVG.const_stride);
        var f32pos = startpos >> 2;
        var vbdata = this._vb._floatArray32 || this._vb.getFloat32Array();
        var vbu32Arr = this._vb._uint32Array;
        var ci = 0;
        var sz = points.length / 2;
        for (var i = 0; i < sz; i++) {
            vbdata[f32pos++] = points[ci];
            vbdata[f32pos++] = points[ci + 1];
            ci += 2;
            vbu32Arr[f32pos++] = rgba;
        }
        this._vb.setNeedUpload();
        this._ib.append(new Uint16Array(ib));
        this._ib.setNeedUpload();
        this.vertNum += sz;
        this.indexNum += ib.length;
    }
    releaseMesh() {
        this._vb.setByteLength(0);
        this._ib.setByteLength(0);
        this.vertNum = 0;
        this.indexNum = 0;
        MeshVG._POOL.push(this);
    }
    destroy() {
        this._ib.destroy();
        this._vb.destroy();
        this._ib.disposeResource();
        this._vb.deleteBuffer();
    }
}
MeshVG.const_stride = 12;
MeshVG._POOL = [];
