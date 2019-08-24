import { VertexBuffer2D } from "./VertexBuffer2D";
import { IndexBuffer2D } from "./IndexBuffer2D";
import { Config } from "./../../../Config";
import { BufferState2D } from "../BufferState2D";
import { LayaGL } from "../../layagl/LayaGL";
export class Mesh2D {
    constructor(stride, vballoc, iballoc) {
        this._stride = 0;
        this.vertNum = 0;
        this.indexNum = 0;
        this._applied = false;
        this._quadNum = 0;
        this.canReuse = false;
        this._stride = stride;
        this._vb = new VertexBuffer2D(stride, LayaGL.instance.DYNAMIC_DRAW);
        if (vballoc) {
            this._vb._resizeBuffer(vballoc, false);
        }
        else {
            Config.webGL2D_MeshAllocMaxMem && this._vb._resizeBuffer(64 * 1024 * stride, false);
        }
        this._ib = new IndexBuffer2D();
        if (iballoc) {
            this._ib._resizeBuffer(iballoc, false);
        }
    }
    cloneWithNewVB() {
        var mesh = new Mesh2D(this._stride, 0, 0);
        mesh._ib = this._ib;
        mesh._quadNum = this._quadNum;
        mesh._attribInfo = this._attribInfo;
        return mesh;
    }
    cloneWithNewVBIB() {
        var mesh = new Mesh2D(this._stride, 0, 0);
        mesh._attribInfo = this._attribInfo;
        return mesh;
    }
    getVBW() {
        this._vb.setNeedUpload();
        return this._vb;
    }
    getVBR() {
        return this._vb;
    }
    getIBR() {
        return this._ib;
    }
    getIBW() {
        this._ib.setNeedUpload();
        return this._ib;
    }
    createQuadIB(QuadNum) {
        this._quadNum = QuadNum;
        this._ib._resizeBuffer(QuadNum * 6 * 2, false);
        this._ib.byteLength = this._ib.bufferLength;
        var bd = this._ib.getUint16Array();
        var idx = 0;
        var curvert = 0;
        for (var i = 0; i < QuadNum; i++) {
            bd[idx++] = curvert;
            bd[idx++] = curvert + 2;
            bd[idx++] = curvert + 1;
            bd[idx++] = curvert;
            bd[idx++] = curvert + 3;
            bd[idx++] = curvert + 2;
            curvert += 4;
        }
        this._ib.setNeedUpload();
    }
    setAttributes(attribs) {
        this._attribInfo = attribs;
        if (this._attribInfo.length % 3 != 0) {
            throw 'Mesh2D setAttributes error!';
        }
    }
    configVAO(gl) {
        if (this._applied)
            return;
        this._applied = true;
        if (!this._vao) {
            this._vao = new BufferState2D();
        }
        this._vao.bind();
        this._vb._bindForVAO();
        this._ib.setNeedUpload();
        this._ib._bind_uploadForVAO();
        var attribNum = this._attribInfo.length / 3;
        var idx = 0;
        for (var i = 0; i < attribNum; i++) {
            var _size = this._attribInfo[idx + 1];
            var _type = this._attribInfo[idx];
            var _off = this._attribInfo[idx + 2];
            gl.enableVertexAttribArray(i);
            gl.vertexAttribPointer(i, _size, _type, false, this._stride, _off);
            idx += 3;
        }
        this._vao.unBind();
    }
    useMesh(gl) {
        this._applied || this.configVAO(gl);
        this._vao.bind();
        this._vb.bind();
        this._ib._bind_upload() || this._ib.bind();
        this._vb._bind_upload() || this._vb.bind();
    }
    getEleNum() {
        return this._ib.getBuffer().byteLength / 2;
    }
    releaseMesh() { }
    destroy() {
    }
    clearVB() {
        this._vb.clear();
    }
}
Mesh2D._gvaoid = 0;
