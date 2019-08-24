import { Camera } from "../Camera";
export class RenderElement {
    constructor() {
        this.renderSubShader = null;
        this.renderType = RenderElement.RENDERTYPE_NORMAL;
    }
    getInvertFront() {
        return this._transform._isFrontFaceInvert;
    }
    setTransform(transform) {
        this._transform = transform;
    }
    setGeometry(geometry) {
        this._geometry = geometry;
    }
    addToOpaqueRenderQueue(context, queue) {
        queue.elements.add(this);
    }
    addToTransparentRenderQueue(context, queue) {
        queue.elements.add(this);
        queue.lastTransparentBatched = false;
        queue.lastTransparentRenderElement = this;
    }
    _update(scene, context, customShader, replacementTag) {
        if (this.material) {
            var subShader = this.material._shader.getSubShaderAt(0);
            this.renderSubShader = null;
            if (customShader) {
                if (replacementTag) {
                    var oriTag = subShader.getFlag(replacementTag);
                    if (oriTag) {
                        var customSubShaders = customShader._subShaders;
                        for (var k = 0, p = customSubShaders.length; k < p; k++) {
                            var customSubShader = customSubShaders[k];
                            if (oriTag === customSubShader.getFlag(replacementTag)) {
                                this.renderSubShader = customSubShader;
                                break;
                            }
                        }
                        if (!this.renderSubShader)
                            return;
                    }
                    else {
                        return;
                    }
                }
                else {
                    this.renderSubShader = customShader.getSubShaderAt(0);
                }
            }
            else {
                this.renderSubShader = subShader;
            }
            var renderQueue = scene._getRenderQueue(this.material.renderQueue);
            if (renderQueue.isTransparent)
                this.addToTransparentRenderQueue(context, renderQueue);
            else
                this.addToOpaqueRenderQueue(context, renderQueue);
        }
    }
    _render(context, isTarget) {
        var lastStateMaterial, lastStateShaderInstance, lastStateRender;
        var updateMark = Camera._updateMark;
        var scene = context.scene;
        var camera = context.camera;
        var transform = this._transform;
        var geometry = this._geometry;
        context.renderElement = this;
        var updateRender = updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType;
        if (updateRender) {
            this.render._renderUpdate(context, transform);
            this.render._renderUpdateWithCamera(context, transform);
            this.render._updateMark = updateMark;
            this.render._updateRenderType = this.renderType;
        }
        if (geometry._prepareRender(context)) {
            var passes = this.renderSubShader._passes;
            for (var j = 0, m = passes.length; j < m; j++) {
                var shaderPass = context.shader = passes[j].withCompile((scene._shaderValues._defineDatas.value) & (~this.material._disablePublicDefineDatas.value), this.render._shaderValues._defineDatas.value, this.material._shaderValues._defineDatas.value);
                var switchShader = shaderPass.bind();
                var switchUpdateMark = (updateMark !== shaderPass._uploadMark);
                var uploadScene = (shaderPass._uploadScene !== scene) || switchUpdateMark;
                if (uploadScene || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._sceneUniformParamsMap, scene._shaderValues, uploadScene);
                    shaderPass._uploadScene = scene;
                }
                var uploadSprite3D = (shaderPass._uploadRender !== this.render || shaderPass._uploadRenderType !== this.renderType) || switchUpdateMark;
                if (uploadSprite3D || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._spriteUniformParamsMap, this.render._shaderValues, uploadSprite3D);
                    shaderPass._uploadRender = this.render;
                    shaderPass._uploadRenderType = this.renderType;
                }
                var uploadCamera = shaderPass._uploadCamera !== camera || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
                    shaderPass._uploadCamera = camera;
                }
                var uploadMaterial = (shaderPass._uploadMaterial !== this.material) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, this.material._shaderValues, uploadMaterial);
                    shaderPass._uploadMaterial = this.material;
                }
                var matValues = this.material._shaderValues;
                if (lastStateMaterial !== this.material || lastStateShaderInstance !== shaderPass) {
                    shaderPass.uploadRenderStateBlendDepth(matValues);
                    shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
                    lastStateMaterial = this.material;
                    lastStateShaderInstance = shaderPass;
                    lastStateRender = this.render;
                }
                else {
                    if (lastStateRender !== this.render) {
                        shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
                        lastStateRender = this.render;
                    }
                }
                geometry._render(context);
                shaderPass._uploadMark = updateMark;
            }
        }
        if (updateRender && this.renderType !== RenderElement.RENDERTYPE_NORMAL)
            this.render._revertBatchRenderUpdate(context);
        Camera._updateMark++;
    }
    destroy() {
        this._transform = null;
        this._geometry = null;
        this.material = null;
        this.render = null;
    }
}
RenderElement.RENDERTYPE_NORMAL = 0;
RenderElement.RENDERTYPE_STATICBATCH = 1;
RenderElement.RENDERTYPE_INSTANCEBATCH = 2;
RenderElement.RENDERTYPE_VERTEXBATCH = 3;
