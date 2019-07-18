import { Render } from "../../../renders/Render";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { BoundBox } from "../../math/BoundBox";
import { ContainmentType } from "../../math/ContainmentType";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Physics3DUtils } from "../../utils/Physics3DUtils";
import { BaseRender } from "../render/BaseRender";
import { ShuriKenParticle3DShaderDeclaration } from "./ShuriKenParticle3DShaderDeclaration";
export class ShurikenParticleRenderer extends BaseRender {
    constructor(owner) {
        super(owner);
        this._finalGravity = new Vector3();
        this._tempRotationMatrix = new Matrix4x4();
        this._renderMode = 0;
        this._mesh = null;
        this.stretchedBillboardCameraSpeedScale = 0;
        this.stretchedBillboardSpeedScale = 0;
        this.stretchedBillboardLengthScale = 0;
        this._defaultBoundBox = new BoundBox(new Vector3(), new Vector3());
        this._renderMode = -1;
        this.stretchedBillboardCameraSpeedScale = 0.0;
        this.stretchedBillboardSpeedScale = 0.0;
        this.stretchedBillboardLengthScale = 1.0;
        this._supportOctree = false;
    }
    get renderMode() {
        return this._renderMode;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        if (this._mesh !== value) {
            (this._mesh) && (this._mesh._removeReference());
            this._mesh = value;
            (value) && (value._addReference());
            this._owner.particleSystem._initBufferDatas();
        }
    }
    set renderMode(value) {
        if (this._renderMode !== value) {
            var defineDatas = this._shaderValues;
            switch (this._renderMode) {
                case 0:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD);
                    break;
                case 1:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
                    break;
                case 2:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
                    break;
                case 3:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
                    break;
                case 4:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH);
                    break;
            }
            this._renderMode = value;
            switch (value) {
                case 0:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD);
                    break;
                case 1:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
                    break;
                case 2:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
                    break;
                case 3:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
                    break;
                case 4:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH);
                    break;
                default:
                    throw new Error("ShurikenParticleRender: unknown renderMode Value.");
            }
            this._owner.particleSystem._initBufferDatas();
        }
    }
    _calculateBoundingBox() {
        var min = this._bounds.getMin();
        min.x = -Number.MAX_VALUE;
        min.y = -Number.MAX_VALUE;
        min.z = -Number.MAX_VALUE;
        this._bounds.setMin(min);
        var max = this._bounds.getMax();
        max.x = Number.MAX_VALUE;
        max.y = Number.MAX_VALUE;
        max.z = Number.MAX_VALUE;
        this._bounds.setMax(max);
        if (Render.supportWebGLPlusCulling) {
            var min = this._bounds.getMin();
            var max = this._bounds.getMax();
            var buffer = FrustumCulling._cullingBuffer;
            buffer[this._cullingBufferIndex + 1] = min.x;
            buffer[this._cullingBufferIndex + 2] = min.y;
            buffer[this._cullingBufferIndex + 3] = min.z;
            buffer[this._cullingBufferIndex + 4] = max.x;
            buffer[this._cullingBufferIndex + 5] = max.y;
            buffer[this._cullingBufferIndex + 6] = max.z;
        }
    }
    _needRender(boundFrustum) {
        if (boundFrustum) {
            if (boundFrustum.containsBoundBox(this.bounds._getBoundBox()) !== ContainmentType.Disjoint) {
                if (this._owner.particleSystem.isAlive)
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
    _renderUpdate(context, transfrom) {
        var particleSystem = this._owner.particleSystem;
        var sv = this._shaderValues;
        var transform = this._owner.transform;
        switch (particleSystem.simulationSpace) {
            case 0:
                break;
            case 1:
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.WORLDPOSITION, transform.position);
                sv.setQuaternion(ShuriKenParticle3DShaderDeclaration.WORLDROTATION, transform.rotation);
                break;
            default:
                throw new Error("ShurikenParticleMaterial: SimulationSpace value is invalid.");
        }
        switch (particleSystem.scaleMode) {
            case 0:
                var scale = transform.scale;
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, scale);
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, scale);
                break;
            case 1:
                var localScale = transform.localScale;
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, localScale);
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, localScale);
                break;
            case 2:
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, transform.scale);
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, Vector3._ONE);
                break;
        }
        Vector3.scale(Physics3DUtils.gravity, particleSystem.gravityModifier, this._finalGravity);
        sv.setVector3(ShuriKenParticle3DShaderDeclaration.GRAVITY, this._finalGravity);
        sv.setInt(ShuriKenParticle3DShaderDeclaration.SIMULATIONSPACE, particleSystem.simulationSpace);
        sv.setBool(ShuriKenParticle3DShaderDeclaration.THREEDSTARTROTATION, particleSystem.threeDStartRotation);
        sv.setInt(ShuriKenParticle3DShaderDeclaration.SCALINGMODE, particleSystem.scaleMode);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDLENGTHSCALE, this.stretchedBillboardLengthScale);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDSPEEDSCALE, this.stretchedBillboardSpeedScale);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.CURRENTTIME, particleSystem._currentTime);
    }
    get bounds() {
        if (this._boundsChange) {
            this._calculateBoundingBox();
            this._boundsChange = false;
        }
        return this._bounds;
    }
    _destroy() {
        super._destroy();
        (this._mesh) && (this._mesh._removeReference(), this._mesh = null);
    }
}
