import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { SkyBox } from "./SkyBox";
export class SkyRenderer {
    constructor() {
        this._mesh = SkyBox.instance;
    }
    get material() {
        return this._material;
    }
    set material(value) {
        if (this._material !== value) {
            (this._material) && (this._material._removeReference());
            (value) && (value._addReference());
            this._material = value;
        }
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        if (this._mesh !== value) {
            this._mesh = value;
        }
    }
    _isAvailable() {
        return this._material && this._mesh ? true : false;
    }
    _render(state) {
        if (this._material && this._mesh) {
            var gl = LayaGL.instance;
            var scene = state.scene;
            var camera = state.camera;
            WebGLContext.setCullFace(gl, false);
            WebGLContext.setDepthFunc(gl, gl.LEQUAL);
            WebGLContext.setDepthMask(gl, false);
            var shader = state.shader = this._material._shader.getSubShaderAt(0)._passes[0].withCompile(0, 0, this._material._shaderValues._defineDatas.value);
            var switchShader = shader.bind();
            var switchShaderLoop = (Stat.loopCount !== shader._uploadMark);
            var uploadScene = (shader._uploadScene !== scene) || switchShaderLoop;
            if (uploadScene || switchShader) {
                shader.uploadUniforms(shader._sceneUniformParamsMap, scene._shaderValues, uploadScene);
                shader._uploadScene = scene;
            }
            var renderTar = camera._renderTexture || camera._offScreenRenderTexture;
            var uploadCamera = (shader._uploadCamera !== camera) || switchShaderLoop;
            if (uploadCamera || switchShader) {
                var viewMatrix = SkyRenderer._tempMatrix0;
                var projectionMatrix = camera.projectionMatrix;
                camera.transform.worldMatrix.cloneTo(viewMatrix);
                viewMatrix.transpose();
                if (camera.orthographic) {
                    projectionMatrix = SkyRenderer._tempMatrix1;
                    Matrix4x4.createPerspective(camera.fieldOfView, camera.aspectRatio, camera.nearPlane, camera.farPlane, projectionMatrix);
                }
                camera._applyViewProject(state, viewMatrix, projectionMatrix, renderTar ? true : false);
                shader.uploadUniforms(shader._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
                shader._uploadCamera = camera;
            }
            var uploadMaterial = (shader._uploadMaterial !== this._material) || switchShaderLoop;
            if (uploadMaterial || switchShader) {
                shader.uploadUniforms(shader._materialUniformParamsMap, this._material._shaderValues, uploadMaterial);
                shader._uploadMaterial = this._material;
            }
            this._mesh._bufferState.bind();
            this._mesh._render(state);
            WebGLContext.setDepthFunc(gl, gl.LESS);
            WebGLContext.setDepthMask(gl, true);
            camera._applyViewProject(state, camera.viewMatrix, camera.projectionMatrix, renderTar ? true : false);
        }
    }
    destroy() {
        if (this._material) {
            this._material._removeReference();
            this._material = null;
        }
    }
}
SkyRenderer._tempMatrix0 = new Matrix4x4();
SkyRenderer._tempMatrix1 = new Matrix4x4();
