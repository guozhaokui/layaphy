import { Sprite } from "../display/Sprite";
import { ParticleSetting } from "./ParticleSetting";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ParticleTemplate2D } from "./ParticleTemplate2D";
import { Emitter2D } from "./emitter/Emitter2D";
import { DrawParticleCmd } from "../display/cmd/DrawParticleCmd";
export class Particle2D extends Sprite {
    constructor(setting) {
        super();
        this._matrix4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.autoPlay = true;
        this.customRenderEnable = true;
        if (setting)
            this.setParticleSetting(setting);
    }
    set url(url) {
        this.load(url);
    }
    load(url) {
        ILaya.loader.load(url, Handler.create(this, this.setParticleSetting), null, ILaya.Loader.JSON);
    }
    setParticleSetting(setting) {
        if (!setting)
            return this.stop();
        ParticleSetting.checkSetting(setting);
        this.customRenderEnable = true;
        this._particleTemplate = new ParticleTemplate2D(setting);
        this.graphics._saveToCmd(null, DrawParticleCmd.create(this._particleTemplate));
        if (!this._emitter) {
            this._emitter = new Emitter2D(this._particleTemplate);
        }
        else {
            this._emitter.template = this._particleTemplate;
        }
        if (this.autoPlay) {
            this.emitter.start();
            this.play();
        }
    }
    get emitter() {
        return this._emitter;
    }
    play() {
        ILaya.timer.frameLoop(1, this, this._loop);
    }
    stop() {
        ILaya.timer.clear(this, this._loop);
    }
    _loop() {
        this.advanceTime(1 / 60);
    }
    advanceTime(passedTime = 1) {
        if (this._canvasTemplate) {
            this._canvasTemplate.advanceTime(passedTime);
        }
        if (this._emitter) {
            this._emitter.advanceTime(passedTime);
        }
    }
    customRender(context, x, y) {
        this._matrix4[0] = context._curMat.a;
        this._matrix4[1] = context._curMat.b;
        this._matrix4[4] = context._curMat.c;
        this._matrix4[5] = context._curMat.d;
        this._matrix4[12] = context._curMat.tx;
        this._matrix4[13] = context._curMat.ty;
        var sv = this._particleTemplate.sv;
        sv.u_mmat = this._matrix4;
        if (this._canvasTemplate) {
            this._canvasTemplate.render(context, x, y);
        }
    }
    destroy(destroyChild = true) {
        if (this._particleTemplate instanceof ParticleTemplate2D)
            this._particleTemplate.dispose();
        super.destroy(destroyChild);
    }
}
ILaya.regClass(Particle2D);
