export class ParticleSetting {
    constructor() {
        this.textureName = null;
        this.textureCount = 1;
        this.maxPartices = 100;
        this.duration = 1;
        this.ageAddScale = 0;
        this.emitterVelocitySensitivity = 1;
        this.minStartSize = 100;
        this.maxStartSize = 100;
        this.minEndSize = 100;
        this.maxEndSize = 100;
        this.minHorizontalVelocity = 0;
        this.maxHorizontalVelocity = 0;
        this.minVerticalVelocity = 0;
        this.maxVerticalVelocity = 0;
        this.endVelocity = 1;
        this.gravity = new Float32Array([0, 0, 0]);
        this.minRotateSpeed = 0;
        this.maxRotateSpeed = 0;
        this.minStartRadius = 0;
        this.maxStartRadius = 0;
        this.minEndRadius = 0;
        this.maxEndRadius = 0;
        this.minHorizontalStartRadian = 0;
        this.maxHorizontalStartRadian = 0;
        this.minVerticalStartRadian = 0;
        this.maxVerticalStartRadian = 0;
        this.useEndRadian = true;
        this.minHorizontalEndRadian = 0;
        this.maxHorizontalEndRadian = 0;
        this.minVerticalEndRadian = 0;
        this.maxVerticalEndRadian = 0;
        this.minStartColor = new Float32Array([1, 1, 1, 1]);
        this.maxStartColor = new Float32Array([1, 1, 1, 1]);
        this.minEndColor = new Float32Array([1, 1, 1, 1]);
        this.maxEndColor = new Float32Array([1, 1, 1, 1]);
        this.colorComponentInter = false;
        this.disableColor = false;
        this.blendState = 0;
        this.emitterType = "null";
        this.emissionRate = 0;
        this.pointEmitterPosition = new Float32Array([0, 0, 0]);
        this.pointEmitterPositionVariance = new Float32Array([0, 0, 0]);
        this.pointEmitterVelocity = new Float32Array([0, 0, 0]);
        this.pointEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
        this.boxEmitterCenterPosition = new Float32Array([0, 0, 0]);
        this.boxEmitterSize = new Float32Array([0, 0, 0]);
        this.boxEmitterVelocity = new Float32Array([0, 0, 0]);
        this.boxEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
        this.sphereEmitterCenterPosition = new Float32Array([0, 0, 0]);
        this.sphereEmitterRadius = 1;
        this.sphereEmitterVelocity = 0;
        this.sphereEmitterVelocityAddVariance = 0;
        this.ringEmitterCenterPosition = new Float32Array([0, 0, 0]);
        this.ringEmitterRadius = 30;
        this.ringEmitterVelocity = 0;
        this.ringEmitterVelocityAddVariance = 0;
        this.ringEmitterUp = 2;
        this.positionVariance = new Float32Array([0, 0, 0]);
    }
    static checkSetting(setting) {
        var key;
        for (key in ParticleSetting._defaultSetting) {
            if (!(key in setting)) {
                setting[key] = ParticleSetting._defaultSetting[key];
            }
        }
        setting.endVelocity = +setting.endVelocity;
        setting.gravity[0] = +setting.gravity[0];
        setting.gravity[1] = +setting.gravity[1];
        setting.gravity[2] = +setting.gravity[2];
    }
}
ParticleSetting._defaultSetting = new ParticleSetting();
