import { Sprite } from "../../../display/Sprite";
import { LayaGL } from "../../../layagl/LayaGL";
import { Loader } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { Render } from "../../../renders/Render";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Context } from "../../../resource/Context";
import { SubmitBase } from "../../../webgl/submit/SubmitBase";
import { SubmitKey } from "../../../webgl/submit/SubmitKey";
import { WebGL } from "../../../webgl/WebGL";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { CastShadowList } from "../../CastShadowList";
import { Animator } from "../../component/Animator";
import { SimpleSingletonList } from "../../component/SimpleSingletonList";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { PhysicsComponent } from "../../physics/PhysicsComponent";
import { PhysicsSettings } from "../../physics/PhysicsSettings";
import { PhysicsSimulation } from "../../physics/PhysicsSimulation";
import { SkyBox } from "../../resource/models/SkyBox";
import { SkyDome } from "../../resource/models/SkyDome";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderInit3D } from "../../shader/ShaderInit3D";
import { BaseCamera } from "../BaseCamera";
import { BaseMaterial } from "../material/BaseMaterial";
import { RenderState } from "../material/RenderState";
import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { RenderQueue } from "../render/RenderQueue";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { BoundsOctree } from "./BoundsOctree";
import { Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";
import { Physics3D } from "../../physics/Physics3D";
import { ILaya } from "../../../../ILaya";
export class Scene3D extends Sprite {
    constructor() {
        super();
        this._lights = [];
        this._lightmaps = [];
        this._skyRenderer = new SkyRenderer();
        this._reflectionMode = 1;
        this._enableLightCount = 3;
        this._input = new Input3D();
        this._timer = ILaya.timer;
        this._collsionTestList = [];
        this._renders = new SimpleSingletonList();
        this._opaqueQueue = new RenderQueue(false);
        this._transparentQueue = new RenderQueue(true);
        this._cameraPool = [];
        this._animatorPool = new SimpleSingletonList();
        this._scriptPool = new Array();
        this._tempScriptPool = new Array();
        this._needClearScriptPool = false;
        this._castShadowRenders = new CastShadowList();
        this.currentCreationLayer = Math.pow(2, 0);
        this.enableLight = true;
        this._key = new SubmitKey();
        this._time = 0;
        this._pickIdToSprite = new Object();
        if (Physics3D._enbalePhysics)
            this._physicsSimulation = new PhysicsSimulation(Scene3D.physicsSettings);
        this._shaderValues = new ShaderData(null);
        this.parallelSplitShadowMaps = [];
        this.enableFog = false;
        this.fogStart = 300;
        this.fogRange = 1000;
        this.fogColor = new Vector3(0.7, 0.7, 0.7);
        this.ambientColor = new Vector3(0.212, 0.227, 0.259);
        this.reflectionIntensity = 1.0;
        (WebGL.shaderHighPrecision) && (this._shaderValues.addDefine(Shader3D.SHADERDEFINE_HIGHPRECISION));
        if (Render.supportWebGLPlusCulling) {
            this._cullingBufferIndices = new Int32Array(1024);
            this._cullingBufferResult = new Int32Array(1024);
        }
        this._shaderValues.setTexture(Scene3D.RANGEATTENUATIONTEXTURE, ShaderInit3D._rangeAttenTex);
        this._scene = this;
        this._input.__init__(Render.canvas, this);
        if (Scene3D.octreeCulling) {
            this._octree = new BoundsOctree(Scene3D.octreeInitialSize, Scene3D.octreeInitialCenter, Scene3D.octreeMinNodeSize, Scene3D.octreeLooseness);
        }
        if (FrustumCulling.debugFrustumCulling) {
            this._debugTool = new PixelLineSprite3D();
            var lineMaterial = new PixelLineMaterial();
            lineMaterial.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
            lineMaterial.alphaTest = false;
            lineMaterial.depthWrite = false;
            lineMaterial.cull = RenderState.CULL_BACK;
            lineMaterial.blend = RenderState.BLEND_ENABLE_ALL;
            lineMaterial.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
            lineMaterial.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            lineMaterial.depthTest = RenderState.DEPTHTEST_LESS;
            this._debugTool.pixelLineRenderer.sharedMaterial = lineMaterial;
        }
    }
    static __init__() {
        Scene3DShaderDeclaration.SHADERDEFINE_FOG = Shader3D.registerPublicDefine("FOG");
        Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT = Shader3D.registerPublicDefine("DIRECTIONLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT = Shader3D.registerPublicDefine("POINTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT = Shader3D.registerPublicDefine("SPOTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW = Shader3D.registerPublicDefine("CASTSHADOW");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM1");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM2");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM3");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO = Shader3D.registerPublicDefine("SHADOWMAP_PCF_NO");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1 = Shader3D.registerPublicDefine("SHADOWMAP_PCF1");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2 = Shader3D.registerPublicDefine("SHADOWMAP_PCF2");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3 = Shader3D.registerPublicDefine("SHADOWMAP_PCF3");
        Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP = Shader3D.registerPublicDefine("REFLECTMAP");
    }
    static load(url, complete) {
        ILaya.loader.create(url, complete, null, Scene3D.HIERARCHY);
    }
    _allotPickColorByID(id, pickColor) {
        var pickColorR = Math.floor(id / (255 * 255));
        id -= pickColorR * 255 * 255;
        var pickColorG = Math.floor(id / 255);
        id -= pickColorG * 255;
        var pickColorB = id;
        pickColor.x = pickColorR / 255;
        pickColor.y = pickColorG / 255;
        pickColor.z = pickColorB / 255;
        pickColor.w = 1.0;
    }
    _searchIDByPickColor(pickColor) {
        var id = pickColor.x * 255 * 255 + pickColor.y * 255 + pickColor.z;
        return id;
    }
    get url() {
        return this._url;
    }
    get enableFog() {
        return this._enableFog;
    }
    set enableFog(value) {
        if (this._enableFog !== value) {
            this._enableFog = value;
            if (value) {
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
            }
            else
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
        }
    }
    get fogColor() {
        return this._shaderValues.getVector3(Scene3D.FOGCOLOR);
    }
    set fogColor(value) {
        this._shaderValues.setVector3(Scene3D.FOGCOLOR, value);
    }
    get fogStart() {
        return this._shaderValues.getNumber(Scene3D.FOGSTART);
    }
    set fogStart(value) {
        this._shaderValues.setNumber(Scene3D.FOGSTART, value);
    }
    get fogRange() {
        return this._shaderValues.getNumber(Scene3D.FOGRANGE);
    }
    set fogRange(value) {
        this._shaderValues.setNumber(Scene3D.FOGRANGE, value);
    }
    get ambientColor() {
        return this._shaderValues.getVector3(Scene3D.AMBIENTCOLOR);
    }
    set ambientColor(value) {
        this._shaderValues.setVector3(Scene3D.AMBIENTCOLOR, value);
    }
    get skyRenderer() {
        return this._skyRenderer;
    }
    get customReflection() {
        return this._shaderValues.getTexture(Scene3D.REFLECTIONTEXTURE);
    }
    set customReflection(value) {
        this._shaderValues.setTexture(Scene3D.REFLECTIONTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        else
            this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
    }
    get reflectionIntensity() {
        return this._shaderValues.getNumber(Scene3D.REFLETIONINTENSITY);
    }
    set reflectionIntensity(value) {
        value = Math.max(Math.min(value, 1.0), 0.0);
        this._shaderValues.setNumber(Scene3D.REFLETIONINTENSITY, value);
    }
    get physicsSimulation() {
        return this._physicsSimulation;
    }
    get reflectionMode() {
        return this._reflectionMode;
    }
    set reflectionMode(value) {
        this._reflectionMode = value;
    }
    get timer() {
        return this._timer;
    }
    set timer(value) {
        this._timer = value;
    }
    get input() {
        return this._input;
    }
    _setLightmapToChildNode(sprite) {
        if (sprite instanceof RenderableSprite3D)
            sprite._render._applyLightMapParams();
        var children = sprite._children;
        for (var i = 0, n = children.length; i < n; i++)
            this._setLightmapToChildNode(children[i]);
    }
    _update() {
        var delta = this.timer._delta / 1000;
        this._time += delta;
        this._shaderValues.setNumber(Scene3D.TIME, this._time);
        var simulation = this._physicsSimulation;
        if (Physics3D._enbalePhysics && !PhysicsSimulation.disableSimulation) {
            simulation._updatePhysicsTransformFromRender();
            PhysicsComponent._addUpdateList = false;
            simulation._simulate(delta);
            simulation._updateCharacters();
            PhysicsComponent._addUpdateList = true;
            simulation._updateCollisions();
            simulation._eventScripts();
        }
        this._input._update();
        this._clearScript();
        this._updateScript();
        Animator._update(this);
        this._lateUpdateScript();
    }
    _binarySearchIndexInCameraPool(camera) {
        var start = 0;
        var end = this._cameraPool.length - 1;
        var mid;
        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            var midValue = this._cameraPool[mid]._renderingOrder;
            if (midValue == camera._renderingOrder)
                return mid;
            else if (midValue > camera._renderingOrder)
                end = mid - 1;
            else
                start = mid + 1;
        }
        return start;
    }
    onEnable() {
        this._input._onCanvasEvent(Render.canvas);
    }
    onDisable() {
        this._input._offCanvasEvent(Render.canvas);
    }
    _setCreateURL(url) {
        this._url = URL.formatURL(url);
    }
    _getGroup() {
        return this._group;
    }
    _setGroup(value) {
        this._group = value;
    }
    _clearScript() {
        if (this._needClearScriptPool) {
            var scripts = this._scriptPool;
            for (var i = 0, n = scripts.length; i < n; i++) {
                var script = scripts[i];
                if (script) {
                    script._indexInPool = this._tempScriptPool.length;
                    this._tempScriptPool.push(script);
                }
            }
            this._scriptPool = this._tempScriptPool;
            scripts.length = 0;
            this._tempScriptPool = scripts;
            this._needClearScriptPool = false;
        }
    }
    _updateScript() {
        var scripts = this._scriptPool;
        for (var i = 0, n = scripts.length; i < n; i++) {
            var script = scripts[i];
            (script && script.enabled) && (script.onUpdate());
        }
    }
    _lateUpdateScript() {
        var scripts = this._scriptPool;
        for (var i = 0, n = scripts.length; i < n; i++) {
            var script = scripts[i];
            (script && script.enabled) && (script.onLateUpdate());
        }
    }
    _addScript(script) {
        var scripts = this._scriptPool;
        script._indexInPool = scripts.length;
        scripts.push(script);
    }
    _removeScript(script) {
        this._scriptPool[script._indexInPool] = null;
        script._indexInPool = -1;
        this._needClearScriptPool = true;
    }
    _preRenderScript() {
        var scripts = this._scriptPool;
        for (var i = 0, n = scripts.length; i < n; i++) {
            var script = scripts[i];
            (script && script.enabled) && (script.onPreRender());
        }
    }
    _postRenderScript() {
        var scripts = this._scriptPool;
        for (var i = 0, n = scripts.length; i < n; i++) {
            var script = scripts[i];
            (script && script.enabled) && (script.onPostRender());
        }
    }
    _prepareSceneToRender() {
        var lightCount = this._lights.length;
        if (lightCount > 0) {
            var renderLightCount = 0;
            for (var i = 0; i < lightCount; i++) {
                if (!this._lights[i]._prepareToScene())
                    continue;
                renderLightCount++;
                if (renderLightCount >= this._enableLightCount)
                    break;
            }
        }
    }
    _addCamera(camera) {
        var index = this._binarySearchIndexInCameraPool(camera);
        var order = camera._renderingOrder;
        var count = this._cameraPool.length;
        while (index < count && this._cameraPool[index]._renderingOrder <= order)
            index++;
        this._cameraPool.splice(index, 0, camera);
    }
    _removeCamera(camera) {
        this._cameraPool.splice(this._cameraPool.indexOf(camera), 1);
    }
    _preCulling(context, camera, shader, replacementTag) {
        FrustumCulling.renderObjectCulling(camera, this, context, this._renders, shader, replacementTag);
    }
    _clear(gl, state) {
        var viewport = state.viewport;
        var camera = state.camera;
        var renderTexture = camera._renderTexture || camera._offScreenRenderTexture;
        var vpW = viewport.width;
        var vpH = viewport.height;
        var vpX = viewport.x;
        var vpY = camera._getCanvasHeight() - viewport.y - vpH;
        gl.viewport(vpX, vpY, vpW, vpH);
        var flag;
        var clearFlag = camera.clearFlag;
        if (clearFlag === BaseCamera.CLEARFLAG_SKY && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
            clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        switch (clearFlag) {
            case BaseCamera.CLEARFLAG_SOLIDCOLOR:
                var clearColor = camera.clearColor;
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(vpX, vpY, vpW, vpH);
                if (clearColor)
                    gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
                else
                    gl.clearColor(0, 0, 0, 0);
                if (renderTexture) {
                    flag = gl.COLOR_BUFFER_BIT;
                    switch (renderTexture.depthStencilFormat) {
                        case BaseTexture.FORMAT_DEPTH_16:
                            flag |= gl.DEPTH_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_STENCIL_8:
                            flag |= gl.STENCIL_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                            flag |= gl.DEPTH_BUFFER_BIT;
                            flag |= gl.STENCIL_BUFFER_BIT;
                            break;
                    }
                }
                else {
                    flag = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
                }
                WebGLContext.setDepthMask(gl, true);
                gl.clear(flag);
                gl.disable(gl.SCISSOR_TEST);
                break;
            case BaseCamera.CLEARFLAG_SKY:
            case BaseCamera.CLEARFLAG_DEPTHONLY:
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(vpX, vpY, vpW, vpH);
                if (renderTexture) {
                    switch (renderTexture.depthStencilFormat) {
                        case BaseTexture.FORMAT_DEPTH_16:
                            flag = gl.DEPTH_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_STENCIL_8:
                            flag = gl.STENCIL_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                            flag = gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
                            break;
                    }
                }
                else {
                    flag = gl.DEPTH_BUFFER_BIT;
                }
                WebGLContext.setDepthMask(gl, true);
                gl.clear(flag);
                gl.disable(gl.SCISSOR_TEST);
                break;
            case BaseCamera.CLEARFLAG_NONE:
                break;
            default:
                throw new Error("BaseScene:camera clearFlag invalid.");
        }
    }
    _renderScene(context) {
        var camera = context.camera;
        var renderTar = camera._renderTexture || camera._offScreenRenderTexture;
        renderTar ? this._opaqueQueue._render(context, true) : this._opaqueQueue._render(context, false);
        if (camera.clearFlag === BaseCamera.CLEARFLAG_SKY) {
            if (camera.skyRenderer._isAvailable())
                camera.skyRenderer._render(context);
            else if (this._skyRenderer._isAvailable())
                this._skyRenderer._render(context);
        }
        renderTar ? this._transparentQueue._render(context, true) : this._transparentQueue._render(context, false);
        if (FrustumCulling.debugFrustumCulling) {
            var renderElements = this._debugTool._render._renderElements;
            for (var i = 0, n = renderElements.length; i < n; i++) {
                renderElements[i]._update(this, context, null, null);
                renderElements[i]._render(context, false);
            }
        }
    }
    _parse(data, spriteMap) {
        var lightMapsData = data.lightmaps;
        if (lightMapsData) {
            var lightMapCount = lightMapsData.length;
            var lightmaps = [];
            for (var i = 0; i < lightMapCount; i++)
                lightmaps[i] = Loader.getRes(lightMapsData[i].path);
            this.setlightmaps(lightmaps);
        }
        var ambientColorData = data.ambientColor;
        if (ambientColorData) {
            var ambCol = this.ambientColor;
            ambCol.fromArray(ambientColorData);
            this.ambientColor = ambCol;
        }
        var skyData = data.sky;
        if (skyData) {
            this._skyRenderer.material = Loader.getRes(skyData.material.path);
            switch (skyData.mesh) {
                case "SkyBox":
                    this._skyRenderer.mesh = SkyBox.instance;
                    break;
                case "SkyDome":
                    this._skyRenderer.mesh = SkyDome.instance;
                    break;
                default:
                    this.skyRenderer.mesh = SkyBox.instance;
            }
        }
        var reflectionTextureData = data.reflectionTexture;
        reflectionTextureData && (this.customReflection = Loader.getRes(reflectionTextureData));
        this.enableFog = data.enableFog;
        this.fogStart = data.fogStart;
        this.fogRange = data.fogRange;
        var fogColorData = data.fogColor;
        if (fogColorData) {
            var fogCol = this.fogColor;
            fogCol.fromArray(fogColorData);
            this.fogColor = fogCol;
        }
    }
    _onActive() {
        super._onActive();
        ILaya.stage._scene3Ds.push(this);
    }
    _onInActive() {
        super._onInActive();
        var scenes = ILaya.stage._scene3Ds;
        scenes.splice(scenes.indexOf(this), 1);
    }
    _addLight(light) {
        if (this._lights.indexOf(light) < 0)
            this._lights.push(light);
    }
    _removeLight(light) {
        var index = this._lights.indexOf(light);
        index >= 0 && (this._lights.splice(index, 1));
    }
    _addRenderObject(render) {
        if (this._octree && render._supportOctree) {
            this._octree.add(render);
        }
        else {
            this._renders.add(render);
            if (Render.supportWebGLPlusCulling) {
                var indexInList = render._getIndexInList();
                var length = this._cullingBufferIndices.length;
                if (indexInList >= length) {
                    var tempIndices = this._cullingBufferIndices;
                    var tempResult = this._cullingBufferResult;
                    this._cullingBufferIndices = new Int32Array(length + 1024);
                    this._cullingBufferResult = new Int32Array(length + 1024);
                    this._cullingBufferIndices.set(tempIndices, 0);
                    this._cullingBufferResult.set(tempResult, 0);
                }
                this._cullingBufferIndices[indexInList] = render._cullingBufferIndex;
            }
        }
    }
    _removeRenderObject(render) {
        if (this._octree && render._supportOctree) {
            this._octree.remove(render);
        }
        else {
            var endRender;
            if (Render.supportWebGLPlusCulling) {
                endRender = this._renders.elements[this._renders.length - 1];
            }
            this._renders.remove(render);
            if (Render.supportWebGLPlusCulling) {
                this._cullingBufferIndices[endRender._getIndexInList()] = endRender._cullingBufferIndex;
            }
        }
    }
    _addShadowCastRenderObject(render) {
        if (this._octree) {
        }
        else {
            this._castShadowRenders.add(render);
        }
    }
    _removeShadowCastRenderObject(render) {
        if (this._octree) {
        }
        else {
            this._castShadowRenders.remove(render);
        }
    }
    _getRenderQueue(index) {
        if (index <= 2500)
            return this._opaqueQueue;
        else
            return this._transparentQueue;
    }
    setlightmaps(value) {
        var maps = this._lightmaps;
        for (var i = 0, n = maps.length; i < n; i++)
            maps[i]._removeReference();
        if (value) {
            var count = value.length;
            maps.length = count;
            for (i = 0; i < count; i++) {
                var lightMap = value[i];
                lightMap._addReference();
                maps[i] = lightMap;
            }
        }
        else {
            throw new Error("Scene3D: value value can't be null.");
        }
        for (i = 0, n = this._children.length; i < n; i++)
            this._setLightmapToChildNode(this._children[i]);
    }
    getlightmaps() {
        return this._lightmaps.slice();
    }
    destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._skyRenderer.destroy();
        this._skyRenderer = null;
        this._lights = null;
        this._lightmaps = null;
        this._renderTargetTexture = null;
        this._shaderValues = null;
        this._renders = null;
        this._castShadowRenders = null;
        this._cameraPool = null;
        this._octree = null;
        this.parallelSplitShadowMaps = null;
        this._physicsSimulation && this._physicsSimulation._destroy();
        Loader.clearRes(this.url);
    }
    render(ctx, x, y) {
        ctx._curSubmit = SubmitBase.RENDERBASE;
        this._children.length > 0 && ctx.addRenderObject(this);
    }
    renderSubmit() {
        var gl = LayaGL.instance;
        this._prepareSceneToRender();
        var i, n, n1;
        for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
            if (Render.supportWebGLPlusRendering)
                ShaderData.setRuntimeValueMode((i == n1) ? true : false);
            var camera = this._cameraPool[i];
            camera.enableRender && camera.render();
        }
        Context.set2DRenderConfig();
        return 1;
    }
    getRenderType() {
        return 0;
    }
    releaseRender() {
    }
    reUse(context, pos) {
        return 0;
    }
}
Scene3D.HIERARCHY = "HIERARCHY";
Scene3D.physicsSettings = new PhysicsSettings();
Scene3D.octreeCulling = false;
Scene3D.octreeInitialSize = 64.0;
Scene3D.octreeInitialCenter = new Vector3(0, 0, 0);
Scene3D.octreeMinNodeSize = 2.0;
Scene3D.octreeLooseness = 1.25;
Scene3D.REFLECTIONMODE_SKYBOX = 0;
Scene3D.REFLECTIONMODE_CUSTOM = 1;
Scene3D.FOGCOLOR = Shader3D.propertyNameToID("u_FogColor");
Scene3D.FOGSTART = Shader3D.propertyNameToID("u_FogStart");
Scene3D.FOGRANGE = Shader3D.propertyNameToID("u_FogRange");
Scene3D.LIGHTDIRECTION = Shader3D.propertyNameToID("u_DirectionLight.Direction");
Scene3D.LIGHTDIRCOLOR = Shader3D.propertyNameToID("u_DirectionLight.Color");
Scene3D.POINTLIGHTPOS = Shader3D.propertyNameToID("u_PointLight.Position");
Scene3D.POINTLIGHTRANGE = Shader3D.propertyNameToID("u_PointLight.Range");
Scene3D.POINTLIGHTATTENUATION = Shader3D.propertyNameToID("u_PointLight.Attenuation");
Scene3D.POINTLIGHTCOLOR = Shader3D.propertyNameToID("u_PointLight.Color");
Scene3D.SPOTLIGHTPOS = Shader3D.propertyNameToID("u_SpotLight.Position");
Scene3D.SPOTLIGHTDIRECTION = Shader3D.propertyNameToID("u_SpotLight.Direction");
Scene3D.SPOTLIGHTSPOTANGLE = Shader3D.propertyNameToID("u_SpotLight.Spot");
Scene3D.SPOTLIGHTRANGE = Shader3D.propertyNameToID("u_SpotLight.Range");
Scene3D.SPOTLIGHTCOLOR = Shader3D.propertyNameToID("u_SpotLight.Color");
Scene3D.SHADOWDISTANCE = Shader3D.propertyNameToID("u_shadowPSSMDistance");
Scene3D.SHADOWLIGHTVIEWPROJECT = Shader3D.propertyNameToID("u_lightShadowVP");
Scene3D.SHADOWMAPPCFOFFSET = Shader3D.propertyNameToID("u_shadowPCFoffset");
Scene3D.SHADOWMAPTEXTURE1 = Shader3D.propertyNameToID("u_shadowMap1");
Scene3D.SHADOWMAPTEXTURE2 = Shader3D.propertyNameToID("u_shadowMap2");
Scene3D.SHADOWMAPTEXTURE3 = Shader3D.propertyNameToID("u_shadowMap3");
Scene3D.AMBIENTCOLOR = Shader3D.propertyNameToID("u_AmbientColor");
Scene3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
Scene3D.REFLETIONINTENSITY = Shader3D.propertyNameToID("u_ReflectIntensity");
Scene3D.TIME = Shader3D.propertyNameToID("u_Time");
Scene3D.ANGLEATTENUATIONTEXTURE = Shader3D.propertyNameToID("u_AngleTexture");
Scene3D.RANGEATTENUATIONTEXTURE = Shader3D.propertyNameToID("u_RangeTexture");
Scene3D.POINTLIGHTMATRIX = Shader3D.propertyNameToID("u_PointLightMatrix");
Scene3D.SPOTLIGHTMATRIX = Shader3D.propertyNameToID("u_SpotLightMatrix");
