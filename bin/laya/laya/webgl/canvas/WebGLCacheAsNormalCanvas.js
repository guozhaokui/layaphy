import { Matrix } from "../../maths/Matrix";
import { SubmitBase } from "../submit/SubmitBase";
import { MeshQuadTexture } from "../utils/MeshQuadTexture";
import { MeshTexture } from "../utils/MeshTexture";
import { MeshVG } from "../utils/MeshVG";
export class WebGLCacheAsNormalCanvas {
    constructor(ctx, sp) {
        this.submitStartPos = 0;
        this.submitEndPos = 0;
        this.context = null;
        this.touches = [];
        this.submits = [];
        this.sprite = null;
        this.meshlist = [];
        this.cachedClipInfo = new Matrix();
        this.oldTx = 0;
        this.oldTy = 0;
        this.invMat = new Matrix();
        this.context = ctx;
        this.sprite = sp;
        ctx._globalClipMatrix.copyTo(this.cachedClipInfo);
    }
    startRec() {
        if (this.context._charSubmitCache._enbale) {
            this.context._charSubmitCache.enable(false, this.context);
            this.context._charSubmitCache.enable(true, this.context);
        }
        this.context._incache = true;
        this.touches.length = 0;
        this.context.touches = this.touches;
        this.context._globalClipMatrix.copyTo(this.cachedClipInfo);
        this.submits.length = 0;
        this.submitStartPos = this.context._submits._length;
        for (var i = 0, sz = this.meshlist.length; i < sz; i++) {
            var curm = this.meshlist[i];
            curm.canReuse ? (curm.releaseMesh()) : (curm.destroy());
        }
        this.meshlist.length = 0;
        this._mesh = MeshQuadTexture.getAMesh(false);
        this._pathMesh = MeshVG.getAMesh(false);
        this._triangleMesh = MeshTexture.getAMesh(false);
        this.meshlist.push(this._mesh);
        this.meshlist.push(this._pathMesh);
        this.meshlist.push(this._triangleMesh);
        this.context._curSubmit = SubmitBase.RENDERBASE;
        this._oldMesh = this.context._mesh;
        this._oldPathMesh = this.context._pathMesh;
        this._oldTriMesh = this.context._triangleMesh;
        this._oldMeshList = this.context.meshlist;
        this.context._mesh = this._mesh;
        this.context._pathMesh = this._pathMesh;
        this.context._triangleMesh = this._triangleMesh;
        this.context.meshlist = this.meshlist;
        this.oldTx = this.context._curMat.tx;
        this.oldTy = this.context._curMat.ty;
        this.context._curMat.tx = 0;
        this.context._curMat.ty = 0;
        this.context._curMat.copyTo(this.invMat);
        this.invMat.invert();
    }
    endRec() {
        if (this.context._charSubmitCache._enbale) {
            this.context._charSubmitCache.enable(false, this.context);
            this.context._charSubmitCache.enable(true, this.context);
        }
        var parsubmits = this.context._submits;
        this.submitEndPos = parsubmits._length;
        var num = this.submitEndPos - this.submitStartPos;
        for (var i = 0; i < num; i++) {
            this.submits.push(parsubmits[this.submitStartPos + i]);
        }
        parsubmits._length -= num;
        this.context._mesh = this._oldMesh;
        this.context._pathMesh = this._oldPathMesh;
        this.context._triangleMesh = this._oldTriMesh;
        this.context.meshlist = this._oldMeshList;
        this.context._curSubmit = SubmitBase.RENDERBASE;
        this.context._curMat.tx = this.oldTx;
        this.context._curMat.ty = this.oldTy;
        this.context.touches = null;
        this.context._incache = false;
    }
    isCacheValid() {
        var curclip = this.context._globalClipMatrix;
        if (curclip.a != this.cachedClipInfo.a || curclip.b != this.cachedClipInfo.b || curclip.c != this.cachedClipInfo.c
            || curclip.d != this.cachedClipInfo.d || curclip.tx != this.cachedClipInfo.tx || curclip.ty != this.cachedClipInfo.ty)
            return false;
        return true;
    }
    flushsubmit() {
        var curSubmit = SubmitBase.RENDERBASE;
        this.submits.forEach(function (subm) {
            if (subm == SubmitBase.RENDERBASE)
                return;
            SubmitBase.preRender = curSubmit;
            curSubmit = subm;
            subm.renderSubmit();
        });
    }
    releaseMem() {
    }
}
WebGLCacheAsNormalCanvas.matI = new Matrix();
