import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { MathUtil } from "../../../maths/MathUtil";
export class ShurikenParticleData {
    constructor() {
    }
    static _getStartLifetimeFromGradient(startLifeTimeGradient, emissionTime) {
        for (var i = 1, n = startLifeTimeGradient.gradientCount; i < n; i++) {
            var key = startLifeTimeGradient.getKeyByIndex(i);
            if (key >= emissionTime) {
                var lastKey = startLifeTimeGradient.getKeyByIndex(i - 1);
                var age = (emissionTime - lastKey) / (key - lastKey);
                return MathUtil.lerp(startLifeTimeGradient.getValueByIndex(i - 1), startLifeTimeGradient.getValueByIndex(i), age);
            }
        }
        throw new Error("ShurikenParticleData: can't get value foam startLifeTimeGradient.");
    }
    static _randomInvertRoationArray(rotatonE, outE, randomizeRotationDirection, rand, randomSeeds) {
        var randDic;
        if (rand) {
            rand.seed = randomSeeds[6];
            randDic = rand.getFloat();
            randomSeeds[6] = rand.seed;
        }
        else {
            randDic = Math.random();
        }
        if (randDic < randomizeRotationDirection) {
            outE.x = -rotatonE.x;
            outE.y = -rotatonE.y;
            outE.z = -rotatonE.z;
        }
        else {
            outE.x = rotatonE.x;
            outE.y = rotatonE.y;
            outE.z = rotatonE.z;
        }
    }
    static _randomInvertRoation(rotaton, randomizeRotationDirection, rand, randomSeeds) {
        var randDic;
        if (rand) {
            rand.seed = randomSeeds[6];
            randDic = rand.getFloat();
            randomSeeds[6] = rand.seed;
        }
        else {
            randDic = Math.random();
        }
        if (randDic < randomizeRotationDirection)
            rotaton = -rotaton;
        return rotaton;
    }
    static create(particleSystem, particleRender, transform) {
        var autoRandomSeed = particleSystem.autoRandomSeed;
        var rand = particleSystem._rand;
        var randomSeeds = particleSystem._randomSeeds;
        switch (particleSystem.startColorType) {
            case 0:
                var constantStartColor = particleSystem.startColorConstant;
                ShurikenParticleData.startColor.x = constantStartColor.x;
                ShurikenParticleData.startColor.y = constantStartColor.y;
                ShurikenParticleData.startColor.z = constantStartColor.z;
                ShurikenParticleData.startColor.w = constantStartColor.w;
                break;
            case 2:
                if (autoRandomSeed) {
                    Vector4.lerp(particleSystem.startColorConstantMin, particleSystem.startColorConstantMax, Math.random(), ShurikenParticleData.startColor);
                }
                else {
                    rand.seed = randomSeeds[3];
                    Vector4.lerp(particleSystem.startColorConstantMin, particleSystem.startColorConstantMax, rand.getFloat(), ShurikenParticleData.startColor);
                    randomSeeds[3] = rand.seed;
                }
                break;
        }
        var colorOverLifetime = particleSystem.colorOverLifetime;
        if (colorOverLifetime && colorOverLifetime.enbale) {
            var color = colorOverLifetime.color;
            switch (color.type) {
                case 0:
                    ShurikenParticleData.startColor.x = ShurikenParticleData.startColor.x * color.constant.x;
                    ShurikenParticleData.startColor.y = ShurikenParticleData.startColor.y * color.constant.y;
                    ShurikenParticleData.startColor.z = ShurikenParticleData.startColor.z * color.constant.z;
                    ShurikenParticleData.startColor.w = ShurikenParticleData.startColor.w * color.constant.w;
                    break;
                case 2:
                    var colorRandom;
                    if (autoRandomSeed) {
                        colorRandom = Math.random();
                    }
                    else {
                        rand.seed = randomSeeds[10];
                        colorRandom = rand.getFloat();
                        randomSeeds[10] = rand.seed;
                    }
                    var minConstantColor = color.constantMin;
                    var maxConstantColor = color.constantMax;
                    ShurikenParticleData.startColor.x = ShurikenParticleData.startColor.x * MathUtil.lerp(minConstantColor.x, maxConstantColor.x, colorRandom);
                    ShurikenParticleData.startColor.y = ShurikenParticleData.startColor.y * MathUtil.lerp(minConstantColor.y, maxConstantColor.y, colorRandom);
                    ShurikenParticleData.startColor.z = ShurikenParticleData.startColor.z * MathUtil.lerp(minConstantColor.z, maxConstantColor.z, colorRandom);
                    ShurikenParticleData.startColor.w = ShurikenParticleData.startColor.w * MathUtil.lerp(minConstantColor.w, maxConstantColor.w, colorRandom);
                    break;
            }
        }
        var particleSize = ShurikenParticleData.startSize;
        switch (particleSystem.startSizeType) {
            case 0:
                if (particleSystem.threeDStartSize) {
                    var startSizeConstantSeparate = particleSystem.startSizeConstantSeparate;
                    particleSize[0] = startSizeConstantSeparate.x;
                    particleSize[1] = startSizeConstantSeparate.y;
                    particleSize[2] = startSizeConstantSeparate.z;
                }
                else {
                    particleSize[0] = particleSize[1] = particleSize[2] = particleSystem.startSizeConstant;
                }
                break;
            case 2:
                if (particleSystem.threeDStartSize) {
                    var startSizeConstantMinSeparate = particleSystem.startSizeConstantMinSeparate;
                    var startSizeConstantMaxSeparate = particleSystem.startSizeConstantMaxSeparate;
                    if (autoRandomSeed) {
                        particleSize[0] = MathUtil.lerp(startSizeConstantMinSeparate.x, startSizeConstantMaxSeparate.x, Math.random());
                        particleSize[1] = MathUtil.lerp(startSizeConstantMinSeparate.y, startSizeConstantMaxSeparate.y, Math.random());
                        particleSize[2] = MathUtil.lerp(startSizeConstantMinSeparate.z, startSizeConstantMaxSeparate.z, Math.random());
                    }
                    else {
                        rand.seed = randomSeeds[4];
                        particleSize[0] = MathUtil.lerp(startSizeConstantMinSeparate.x, startSizeConstantMaxSeparate.x, rand.getFloat());
                        particleSize[1] = MathUtil.lerp(startSizeConstantMinSeparate.y, startSizeConstantMaxSeparate.y, rand.getFloat());
                        particleSize[2] = MathUtil.lerp(startSizeConstantMinSeparate.z, startSizeConstantMaxSeparate.z, rand.getFloat());
                        randomSeeds[4] = rand.seed;
                    }
                }
                else {
                    if (autoRandomSeed) {
                        particleSize[0] = particleSize[1] = particleSize[2] = MathUtil.lerp(particleSystem.startSizeConstantMin, particleSystem.startSizeConstantMax, Math.random());
                    }
                    else {
                        rand.seed = randomSeeds[4];
                        particleSize[0] = particleSize[1] = particleSize[2] = MathUtil.lerp(particleSystem.startSizeConstantMin, particleSystem.startSizeConstantMax, rand.getFloat());
                        randomSeeds[4] = rand.seed;
                    }
                }
                break;
        }
        var sizeOverLifetime = particleSystem.sizeOverLifetime;
        if (sizeOverLifetime && sizeOverLifetime.enbale && sizeOverLifetime.size.type === 1) {
            var size = sizeOverLifetime.size;
            if (size.separateAxes) {
                if (autoRandomSeed) {
                    particleSize[0] = particleSize[0] * MathUtil.lerp(size.constantMinSeparate.x, size.constantMaxSeparate.x, Math.random());
                    particleSize[1] = particleSize[1] * MathUtil.lerp(size.constantMinSeparate.y, size.constantMaxSeparate.y, Math.random());
                    particleSize[2] = particleSize[2] * MathUtil.lerp(size.constantMinSeparate.z, size.constantMaxSeparate.z, Math.random());
                }
                else {
                    rand.seed = randomSeeds[11];
                    particleSize[0] = particleSize[0] * MathUtil.lerp(size.constantMinSeparate.x, size.constantMaxSeparate.x, rand.getFloat());
                    particleSize[1] = particleSize[1] * MathUtil.lerp(size.constantMinSeparate.y, size.constantMaxSeparate.y, rand.getFloat());
                    particleSize[2] = particleSize[2] * MathUtil.lerp(size.constantMinSeparate.z, size.constantMaxSeparate.z, rand.getFloat());
                    randomSeeds[11] = rand.seed;
                }
            }
            else {
                var randomSize;
                if (autoRandomSeed) {
                    randomSize = MathUtil.lerp(size.constantMin, size.constantMax, Math.random());
                }
                else {
                    rand.seed = randomSeeds[11];
                    randomSize = MathUtil.lerp(size.constantMin, size.constantMax, rand.getFloat());
                    randomSeeds[11] = rand.seed;
                }
                particleSize[0] = particleSize[0] * randomSize;
                particleSize[1] = particleSize[1] * randomSize;
                particleSize[2] = particleSize[2] * randomSize;
            }
        }
        var renderMode = particleRender.renderMode;
        if (renderMode !== 1) {
            switch (particleSystem.startRotationType) {
                case 0:
                    if (particleSystem.threeDStartRotation) {
                        var startRotationConstantSeparate = particleSystem.startRotationConstantSeparate;
                        var randomRotationE = ShurikenParticleData._tempVector30;
                        ShurikenParticleData._randomInvertRoationArray(startRotationConstantSeparate, randomRotationE, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
                        ShurikenParticleData.startRotation[0] = randomRotationE.x;
                        ShurikenParticleData.startRotation[1] = randomRotationE.y;
                        if (renderMode !== 4)
                            ShurikenParticleData.startRotation[2] = -randomRotationE.z;
                        else
                            ShurikenParticleData.startRotation[2] = randomRotationE.z;
                    }
                    else {
                        ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(particleSystem.startRotationConstant, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
                        ShurikenParticleData.startRotation[1] = 0;
                        ShurikenParticleData.startRotation[2] = 0;
                    }
                    break;
                case 2:
                    if (particleSystem.threeDStartRotation) {
                        var startRotationConstantMinSeparate = particleSystem.startRotationConstantMinSeparate;
                        var startRotationConstantMaxSeparate = particleSystem.startRotationConstantMaxSeparate;
                        var lerpRoationE = ShurikenParticleData._tempVector30;
                        if (autoRandomSeed) {
                            lerpRoationE.x = MathUtil.lerp(startRotationConstantMinSeparate.x, startRotationConstantMaxSeparate.x, Math.random());
                            lerpRoationE.y = MathUtil.lerp(startRotationConstantMinSeparate.y, startRotationConstantMaxSeparate.y, Math.random());
                            lerpRoationE.z = MathUtil.lerp(startRotationConstantMinSeparate.z, startRotationConstantMaxSeparate.z, Math.random());
                        }
                        else {
                            rand.seed = randomSeeds[5];
                            lerpRoationE.x = MathUtil.lerp(startRotationConstantMinSeparate.x, startRotationConstantMaxSeparate.x, rand.getFloat());
                            lerpRoationE.y = MathUtil.lerp(startRotationConstantMinSeparate.y, startRotationConstantMaxSeparate.y, rand.getFloat());
                            lerpRoationE.z = MathUtil.lerp(startRotationConstantMinSeparate.z, startRotationConstantMaxSeparate.z, rand.getFloat());
                            randomSeeds[5] = rand.seed;
                        }
                        ShurikenParticleData._randomInvertRoationArray(lerpRoationE, lerpRoationE, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
                        ShurikenParticleData.startRotation[0] = lerpRoationE.x;
                        ShurikenParticleData.startRotation[1] = lerpRoationE.y;
                        if (renderMode !== 4)
                            ShurikenParticleData.startRotation[2] = -lerpRoationE.z;
                        else
                            ShurikenParticleData.startRotation[2] = lerpRoationE.z;
                    }
                    else {
                        if (autoRandomSeed) {
                            ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(MathUtil.lerp(particleSystem.startRotationConstantMin, particleSystem.startRotationConstantMax, Math.random()), particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
                        }
                        else {
                            rand.seed = randomSeeds[5];
                            ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(MathUtil.lerp(particleSystem.startRotationConstantMin, particleSystem.startRotationConstantMax, rand.getFloat()), particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
                            randomSeeds[5] = rand.seed;
                        }
                    }
                    break;
            }
        }
        switch (particleSystem.startLifetimeType) {
            case 0:
                ShurikenParticleData.startLifeTime = particleSystem.startLifetimeConstant;
                break;
            case 1:
                ShurikenParticleData.startLifeTime = ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradient, particleSystem.emissionTime);
                break;
            case 2:
                if (autoRandomSeed) {
                    ShurikenParticleData.startLifeTime = MathUtil.lerp(particleSystem.startLifetimeConstantMin, particleSystem.startLifetimeConstantMax, Math.random());
                }
                else {
                    rand.seed = randomSeeds[7];
                    ShurikenParticleData.startLifeTime = MathUtil.lerp(particleSystem.startLifetimeConstantMin, particleSystem.startLifetimeConstantMax, rand.getFloat());
                    randomSeeds[7] = rand.seed;
                }
                break;
            case 3:
                var emissionTime = particleSystem.emissionTime;
                if (autoRandomSeed) {
                    ShurikenParticleData.startLifeTime = MathUtil.lerp(ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMin, emissionTime), ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMax, emissionTime), Math.random());
                }
                else {
                    rand.seed = randomSeeds[7];
                    ShurikenParticleData.startLifeTime = MathUtil.lerp(ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMin, emissionTime), ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMax, emissionTime), rand.getFloat());
                    randomSeeds[7] = rand.seed;
                }
                break;
        }
        switch (particleSystem.startSpeedType) {
            case 0:
                ShurikenParticleData.startSpeed = particleSystem.startSpeedConstant;
                break;
            case 2:
                if (autoRandomSeed) {
                    ShurikenParticleData.startSpeed = MathUtil.lerp(particleSystem.startSpeedConstantMin, particleSystem.startSpeedConstantMax, Math.random());
                }
                else {
                    rand.seed = randomSeeds[8];
                    ShurikenParticleData.startSpeed = MathUtil.lerp(particleSystem.startSpeedConstantMin, particleSystem.startSpeedConstantMax, rand.getFloat());
                    randomSeeds[8] = rand.seed;
                }
                break;
        }
        var textureSheetAnimation = particleSystem.textureSheetAnimation;
        var enableSheetAnimation = textureSheetAnimation && textureSheetAnimation.enable;
        if (enableSheetAnimation) {
            var title = textureSheetAnimation.tiles;
            var titleX = title.x, titleY = title.y;
            var subU = 1.0 / titleX, subV = 1.0 / titleY;
            var startFrameCount;
            var startFrame = textureSheetAnimation.startFrame;
            switch (startFrame.type) {
                case 0:
                    startFrameCount = startFrame.constant;
                    break;
                case 1:
                    if (autoRandomSeed) {
                        startFrameCount = MathUtil.lerp(startFrame.constantMin, startFrame.constantMax, Math.random());
                    }
                    else {
                        rand.seed = randomSeeds[14];
                        startFrameCount = MathUtil.lerp(startFrame.constantMin, startFrame.constantMax, rand.getFloat());
                        randomSeeds[14] = rand.seed;
                    }
                    break;
            }
            var frame = textureSheetAnimation.frame;
            switch (frame.type) {
                case 0:
                    startFrameCount += frame.constant;
                    break;
                case 2:
                    if (autoRandomSeed) {
                        startFrameCount += MathUtil.lerp(frame.constantMin, frame.constantMax, Math.random());
                    }
                    else {
                        rand.seed = randomSeeds[15];
                        startFrameCount += MathUtil.lerp(frame.constantMin, frame.constantMax, rand.getFloat());
                        randomSeeds[15] = rand.seed;
                    }
                    break;
            }
            var startRow = 0;
            switch (textureSheetAnimation.type) {
                case 0:
                    startRow = Math.floor(startFrameCount / titleX);
                    break;
                case 1:
                    if (textureSheetAnimation.randomRow) {
                        if (autoRandomSeed) {
                            startRow = Math.floor(Math.random() * titleY);
                        }
                        else {
                            rand.seed = randomSeeds[13];
                            startRow = Math.floor(rand.getFloat() * titleY);
                            randomSeeds[13] = rand.seed;
                        }
                    }
                    else {
                        startRow = textureSheetAnimation.rowIndex;
                    }
                    break;
            }
            var startCol = Math.floor(startFrameCount % titleX);
            ShurikenParticleData.startUVInfo = ShurikenParticleData.startUVInfo;
            ShurikenParticleData.startUVInfo[0] = subU;
            ShurikenParticleData.startUVInfo[1] = subV;
            ShurikenParticleData.startUVInfo[2] = startCol * subU;
            ShurikenParticleData.startUVInfo[3] = startRow * subV;
        }
        else {
            ShurikenParticleData.startUVInfo = ShurikenParticleData.startUVInfo;
            ShurikenParticleData.startUVInfo[0] = 1.0;
            ShurikenParticleData.startUVInfo[1] = 1.0;
            ShurikenParticleData.startUVInfo[2] = 0.0;
            ShurikenParticleData.startUVInfo[3] = 0.0;
        }
        switch (particleSystem.simulationSpace) {
            case 0:
                var position = transform.position;
                ShurikenParticleData.simulationWorldPostion[0] = position.x;
                ShurikenParticleData.simulationWorldPostion[1] = position.y;
                ShurikenParticleData.simulationWorldPostion[2] = position.z;
                var rotation = transform.rotation;
                ShurikenParticleData.simulationWorldRotation[0] = rotation.x;
                ShurikenParticleData.simulationWorldRotation[1] = rotation.y;
                ShurikenParticleData.simulationWorldRotation[2] = rotation.z;
                ShurikenParticleData.simulationWorldRotation[3] = rotation.w;
                break;
            case 1:
                break;
            default:
                throw new Error("ShurikenParticleMaterial: SimulationSpace value is invalid.");
                break;
        }
    }
}
ShurikenParticleData._tempVector30 = new Vector3();
ShurikenParticleData._tempQuaternion = new Quaternion();
ShurikenParticleData.startColor = new Vector4();
ShurikenParticleData.startSize = new Float32Array(3);
ShurikenParticleData.startRotation = new Float32Array(3);
ShurikenParticleData.startUVInfo = new Float32Array(4);
ShurikenParticleData.simulationWorldPostion = new Float32Array(3);
ShurikenParticleData.simulationWorldRotation = new Float32Array(4);
