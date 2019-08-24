import { ParticleTemplateWebGL } from "./ParticleTemplateWebGL";
import { ParticleShaderValue } from "./shader/value/ParticleShaderValue";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { MeshParticle2D } from "../webgl/utils/MeshParticle2D";
import { WebGLContext } from "../webgl/WebGLContext";
import { Stat } from "../utils/Stat";
export class ParticleTemplate2D extends ParticleTemplateWebGL {
    constructor(parSetting) {
        super(parSetting);
        this.x = 0;
        this.y = 0;
        this.sv = new ParticleShaderValue();
        this._key = {};
        var _this = this;
        ILaya.loader.load(this.settings.textureName, Handler.create(null, function (texture) {
            _this.texture = texture;
        }));
        this.sv.u_Duration = this.settings.duration;
        this.sv.u_Gravity = this.settings.gravity;
        this.sv.u_EndVelocity = this.settings.endVelocity;
        this._blendFn = BlendMode.fns[parSetting.blendState];
        this._mesh = MeshParticle2D.getAMesh(this.settings.maxPartices);
        this.initialize();
    }
    getRenderType() { return -111; }
    releaseRender() { }
    addParticleArray(position, velocity) {
        position[0] += this.x;
        position[1] += this.y;
        super.addParticleArray(position, velocity);
    }
    addNewParticlesToVertexBuffer() {
        var _vertexBuffer2D = this._mesh._vb;
        _vertexBuffer2D.clear();
        _vertexBuffer2D.append(this._vertices);
        var start;
        if (this._firstNewElement < this._firstFreeElement) {
            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
            _vertexBuffer2D.subUpload(start, start, start + (this._firstFreeElement - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
        }
        else {
            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
            _vertexBuffer2D.subUpload(start, start, start + (this.settings.maxPartices - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
            if (this._firstFreeElement > 0) {
                _vertexBuffer2D.setNeedUpload();
                _vertexBuffer2D.subUpload(0, 0, this._firstFreeElement * 4 * this._floatCountPerVertex * 4);
            }
        }
        this._firstNewElement = this._firstFreeElement;
    }
    renderSubmit() {
        if (this.texture && this.texture.getIsReady()) {
            this.update(ILaya.timer._delta);
            this.sv.u_CurrentTime = this._currentTime;
            if (this._firstNewElement != this._firstFreeElement) {
                this.addNewParticlesToVertexBuffer();
            }
            this.blend();
            if (this._firstActiveElement != this._firstFreeElement) {
                var gl = WebGLContext.mainContext;
                this._mesh.useMesh(gl);
                this.sv.u_texture = this.texture._getSource();
                this.sv.upload();
                if (this._firstActiveElement < this._firstFreeElement) {
                    gl.drawElements(gl.TRIANGLES, (this._firstFreeElement - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
                }
                else {
                    WebGLContext.mainContext.drawElements(gl.TRIANGLES, (this.settings.maxPartices - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
                    if (this._firstFreeElement > 0)
                        gl.drawElements(gl.TRIANGLES, this._firstFreeElement * 6, gl.UNSIGNED_SHORT, 0);
                }
                Stat.renderBatches++;
            }
            this._drawCounter++;
        }
        return 1;
    }
    updateParticleForNative() {
        if (this.texture && this.texture.getIsReady()) {
            this.update(ILaya.timer._delta);
            this.sv.u_CurrentTime = this._currentTime;
            if (this._firstNewElement != this._firstFreeElement) {
                this._firstNewElement = this._firstFreeElement;
            }
        }
    }
    getMesh() {
        return this._mesh;
    }
    getConchMesh() {
        return this._conchMesh;
    }
    getFirstNewElement() {
        return this._firstNewElement;
    }
    getFirstFreeElement() {
        return this._firstFreeElement;
    }
    getFirstActiveElement() {
        return this._firstActiveElement;
    }
    getFirstRetiredElement() {
        return this._firstRetiredElement;
    }
    setFirstFreeElement(_value) {
        this._firstFreeElement = _value;
    }
    setFirstNewElement(_value) {
        this._firstNewElement = _value;
    }
    addDrawCounter() {
        this._drawCounter++;
    }
    blend() {
        if (BlendMode.activeBlendFunction !== this._blendFn) {
            var gl = WebGLContext.mainContext;
            gl.enable(gl.BLEND);
            this._blendFn(gl);
            BlendMode.activeBlendFunction = this._blendFn;
        }
    }
    dispose() {
        this._mesh.releaseMesh();
    }
}
ParticleTemplate2D.activeBlendType = -1;
