import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderDefine } from "laya/d3/shader/ShaderDefine";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import simpleFS from "./voxel_fs";
import simpleVS from "./voxel_vs";


export class VoxelMaterial extends BaseMaterial {
    static DIFFUSETEXTURE = Shader3D.propertyNameToID("u_texture");
    static SHADERDEFINE_SELFDEPTH: ShaderDefine;
    /**高光强度数据源_漫反射贴图的Alpha通道。*/
    static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
    /**高光强度数据源_高光贴图的RGB通道。*/
    static SPECULARSOURCE_SPECULARMAP: number;

    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE: number = 0;
    /**渲染状态_阿尔法测试。*/
    static RENDERMODE_CUTOUT: number = 1;
    /**渲染状态_透明混合。*/
    static RENDERMODE_TRANSPARENT: number = 2;

    static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
    static SHADERDEFINE_NORMALMAP: ShaderDefine;
    static SHADERDEFINE_SPECULARMAP: ShaderDefine;
    static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

    static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
    static SPECULARTEXTURE: number = Shader3D.propertyNameToID("u_SpecularTexture");
    static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_DiffuseColor");
    static MATERIALSPECULAR: number = Shader3D.propertyNameToID("u_MaterialSpecular");
    static SHININESS: number = Shader3D.propertyNameToID("u_Shininess");
    static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
    static CULL: number = Shader3D.propertyNameToID("s_Cull");
    static BLEND: number = Shader3D.propertyNameToID("s_Blend");
    static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
    static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
    static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
    static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");


    static __initDefine__(): void {
    }

    public get diffuserTexture(): BaseTexture {
        return this._shaderValues.getTexture(VoxelMaterial.DIFFUSETEXTURE);
    }
    public set diffuserTexture(value: BaseTexture) {
        this._shaderValues.setTexture(VoxelMaterial.DIFFUSETEXTURE, value);
    }

    static __init__(): void {
    }

    static initShader(): void {
        VoxelMaterial.__init__();
        var attributeMap: any = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Normal': VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
            'a_Tangent0': VertexMesh.MESH_TANGENT0
        }
        var uniformMap: any = {
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Shader3D.PERIOD_SPRITE
        }

        var shader = Shader3D.add("SelfMaterialShader");
        var subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        var pass1 = subShader.addShaderPass(simpleVS, simpleFS);
        pass1.renderState.cull = RenderState.CULL_NONE
    }

    constructor() {
        super();
        this.setShaderName("SelfMaterialShader");
        // 设置参数
        this.renderMode = VoxelMaterial.RENDERMODE_TRANSPARENT
    }

	/**
	 * 设置渲染模式。
	 * @return 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case VoxelMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case VoxelMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case VoxelMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("Material:renderMode value error.");
        }
    }

	/**
	 * 设置是否写入深度。
	 * @param value 是否写入深度。
	 */
    set depthWrite(value: boolean) {
        this._shaderValues.setBool(VoxelMaterial.DEPTH_WRITE, value);
    }

	/**
	 * 获取是否写入深度。
	 * @return 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(VoxelMaterial.DEPTH_WRITE);
    }

	/**
	 * 设置剔除方式。
	 * @param value 剔除方式。
	 */
    set cull(value: number) {
        this._shaderValues.setInt(VoxelMaterial.CULL, value);
    }

	/**
	 * 获取剔除方式。
	 * @return 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(VoxelMaterial.CULL);
    }

	/**
	 * 设置混合方式。
	 * @param value 混合方式。
	 */
    set blend(value: number) {
        this._shaderValues.setInt(VoxelMaterial.BLEND, value);
    }

	/**
	 * 获取混合方式。
	 * @return 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(VoxelMaterial.BLEND);
    }

	/**
	 * 设置混合源。
	 * @param value 混合源
	 */
    set blendSrc(value: number) {
        this._shaderValues.setInt(VoxelMaterial.BLEND_SRC, value);
    }

	/**
	 * 获取混合源。
	 * @return 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(VoxelMaterial.BLEND_SRC);
    }

	/**
	 * 设置混合目标。
	 * @param value 混合目标
	 */
    set blendDst(value: number) {
        this._shaderValues.setInt(VoxelMaterial.BLEND_DST, value);
    }

	/**
	 * 获取混合目标。
	 * @return 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(VoxelMaterial.BLEND_DST);
    }

	/**
	 * 设置深度测试方式。
	 * @param value 深度测试方式
	 */
    set depthTest(value: number) {
        this._shaderValues.setInt(VoxelMaterial.DEPTH_TEST, value);
    }

	/**
	 * 获取深度测试方式。
	 * @return 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(VoxelMaterial.DEPTH_TEST);
    }



}