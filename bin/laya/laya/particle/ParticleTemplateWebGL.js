import { ParticleTemplateBase } from "./ParticleTemplateBase";
import { ParticleData } from "./ParticleData";
export class ParticleTemplateWebGL extends ParticleTemplateBase {
    constructor(parSetting) {
        super();
        this._floatCountPerVertex = 29;
        this._firstActiveElement = 0;
        this._firstNewElement = 0;
        this._firstFreeElement = 0;
        this._firstRetiredElement = 0;
        this._currentTime = 0;
        this.settings = parSetting;
    }
    reUse(context, pos) {
        return 0;
    }
    initialize() {
        var floatStride = 0;
        this._vertices = this._mesh._vb.getFloat32Array();
        floatStride = this._mesh._stride / 4;
        var bufi = 0;
        var bufStart = 0;
        for (var i = 0; i < this.settings.maxPartices; i++) {
            var random = Math.random();
            var cornerYSegement = this.settings.textureCount ? 1.0 / this.settings.textureCount : 1.0;
            var cornerY;
            for (cornerY = 0; cornerY < this.settings.textureCount; cornerY += cornerYSegement) {
                if (random < cornerY + cornerYSegement)
                    break;
            }
            this._vertices[bufi++] = -1;
            this._vertices[bufi++] = -1;
            this._vertices[bufi++] = 0;
            this._vertices[bufi++] = cornerY;
            bufi = (bufStart += floatStride);
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = -1;
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = cornerY;
            bufi = bufStart += floatStride;
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = cornerY + cornerYSegement;
            bufi = bufStart += floatStride;
            this._vertices[bufi++] = -1;
            this._vertices[bufi++] = 1;
            this._vertices[bufi++] = 0;
            this._vertices[bufi++] = cornerY + cornerYSegement;
            bufi = bufStart += floatStride;
        }
    }
    update(elapsedTime) {
        this._currentTime += elapsedTime / 1000;
        this.retireActiveParticles();
        this.freeRetiredParticles();
        if (this._firstActiveElement == this._firstFreeElement)
            this._currentTime = 0;
        if (this._firstRetiredElement == this._firstActiveElement)
            this._drawCounter = 0;
    }
    retireActiveParticles() {
        const epsilon = 0.0001;
        var particleDuration = this.settings.duration;
        while (this._firstActiveElement != this._firstNewElement) {
            var offset = this._firstActiveElement * this._floatCountPerVertex * 4;
            var index = offset + 28;
            var particleAge = this._currentTime - this._vertices[index];
            particleAge *= (1.0 + this._vertices[offset + 27]);
            if (particleAge + epsilon < particleDuration)
                break;
            this._vertices[index] = this._drawCounter;
            this._firstActiveElement++;
            if (this._firstActiveElement >= this.settings.maxPartices)
                this._firstActiveElement = 0;
        }
    }
    freeRetiredParticles() {
        while (this._firstRetiredElement != this._firstActiveElement) {
            var age = this._drawCounter - this._vertices[this._firstRetiredElement * this._floatCountPerVertex * 4 + 28];
            if (age < 3)
                break;
            this._firstRetiredElement++;
            if (this._firstRetiredElement >= this.settings.maxPartices)
                this._firstRetiredElement = 0;
        }
    }
    addNewParticlesToVertexBuffer() {
    }
    addParticleArray(position, velocity) {
        var nextFreeParticle = this._firstFreeElement + 1;
        if (nextFreeParticle >= this.settings.maxPartices)
            nextFreeParticle = 0;
        if (nextFreeParticle === this._firstRetiredElement)
            return;
        var particleData = ParticleData.Create(this.settings, position, velocity, this._currentTime);
        var startIndex = this._firstFreeElement * this._floatCountPerVertex * 4;
        for (var i = 0; i < 4; i++) {
            var j, offset;
            for (j = 0, offset = 4; j < 3; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.position[j];
            for (j = 0, offset = 7; j < 3; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.velocity[j];
            for (j = 0, offset = 10; j < 4; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.startColor[j];
            for (j = 0, offset = 14; j < 4; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.endColor[j];
            for (j = 0, offset = 18; j < 3; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.sizeRotation[j];
            for (j = 0, offset = 21; j < 2; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radius[j];
            for (j = 0, offset = 23; j < 4; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radian[j];
            this._vertices[startIndex + i * this._floatCountPerVertex + 27] = particleData.durationAddScale;
            this._vertices[startIndex + i * this._floatCountPerVertex + 28] = particleData.time;
        }
        this._firstFreeElement = nextFreeParticle;
    }
}
