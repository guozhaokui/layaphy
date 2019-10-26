import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import defVS from "./VoxelRender/std_vs.glsl";
import defPS from "./VoxelRender/std_ps.glsl";
import { Texture2D } from "laya/resource/Texture2D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";

interface ShaderDefine{};

var  hasInited=false;

export class DefaultMaterial extends BaseMaterial {
    static SHADERDEFINE_SELFDEPTH: ShaderDefine;
    /**高光强度数据源_漫反射贴图的Alpha通道。*/
    static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
    /**高光强度数据源_高光贴图的RGB通道。*/
    static SPECULARSOURCE_SPECULARMAP: number;
    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE = 0;
    /**渲染状态_阿尔法测试。*/
    static RENDERMODE_CUTOUT = 1;
    /**渲染状态_透明混合。*/
    static RENDERMODE_TRANSPARENT = 2;

    static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
    static SHADERDEFINE_NORMALMAP: ShaderDefine;
    static SHADERDEFINE_SPECULARMAP: ShaderDefine;
    static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

    static BASETEXTURE = Shader3D.propertyNameToID("texBaseColor");
    static NORMALTEXTURE = Shader3D.propertyNameToID("texNormal");
	static ENVTEXTURE = Shader3D.propertyNameToID("texPrefilterdEnv");
	static LUTTEXTURE = Shader3D.propertyNameToID('texBRDFLUT');
	static SPHR = Shader3D.propertyNameToID('irrad_mat_red');
	static SPHG = Shader3D.propertyNameToID('irrad_mat_green');
	static SPHB = Shader3D.propertyNameToID('irrad_mat_blue');
	static HDRE = Shader3D.propertyNameToID('u_roughness_metaless_hdrexp');
    static MATERIALSPECULAR = Shader3D.propertyNameToID("u_MaterialSpecular");
    static SHININESS = Shader3D.propertyNameToID("u_Shininess");
	static TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	
	// state 设置
    static CULL = Shader3D.propertyNameToID("s_Cull");
    static BLEND = Shader3D.propertyNameToID("s_Blend");
    static BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
    static BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
    static DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
    static DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");


    static __initDefine__(): void {
    }

    get diffuserTexture(): BaseTexture {
        return this._shaderValues.getTexture(DefaultMaterial.BASETEXTURE);
	}
	
    set diffuserTexture(value: BaseTexture) {
        this._shaderValues.setTexture(DefaultMaterial.BASETEXTURE, value);
	}
	
	setEnvTexture(t:Texture2D){
		this._shaderValues.setTexture(DefaultMaterial.ENVTEXTURE,t);
	}

	setLUTTexture(t:Texture2D){
		this._shaderValues.setTexture(DefaultMaterial.LUTTEXTURE,t);
	}

	setSPHValue(r:Matrix4x4,g:Matrix4x4,b:Matrix4x4){
		this._shaderValues.setMatrix4x4(DefaultMaterial.SPHR,r);
		this._shaderValues.setMatrix4x4(DefaultMaterial.SPHG,g);
		this._shaderValues.setMatrix4x4(DefaultMaterial.SPHB,b);
	}

    static __init__(): void {
    }

    static initShader(): void {
        DefaultMaterial.__init__();
        var attributeMap = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Normal': VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
            'a_Tangent0': VertexMesh.MESH_TANGENT0
		}
		
        var uniformMap = {
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
			'u_WorldMat': Shader3D.PERIOD_SPRITE,
			'u_DiffuseColor': Shader3D.PERIOD_MATERIAL,
			'texBaseColor': Shader3D.PERIOD_MATERIAL,
			'texNormal': Shader3D.PERIOD_MATERIAL,
			'texPrefilterdEnv': Shader3D.PERIOD_MATERIAL,
			'texBRDFLUT': Shader3D.PERIOD_MATERIAL,
			'irrad_mat_red': Shader3D.PERIOD_MATERIAL,
			'irrad_mat_green': Shader3D.PERIOD_MATERIAL,
			'irrad_mat_blue': Shader3D.PERIOD_MATERIAL,
			'u_roughness_metaless_hdrexp': Shader3D.PERIOD_MATERIAL
		}

		var stateMap = {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		}

        var shader = Shader3D.add("SelfMaterialShader");
        var subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        var pass1 = subShader.addShaderPass(defVS, defPS,stateMap);
        //pass1.renderState.cull = RenderState.CULL_NONE
    }

    constructor() {
		if(!hasInited){
			DefaultMaterial.initShader();
			hasInited=true;
		}
        super();
        this.setShaderName("SelfMaterialShader");
        // 设置参数
        this.renderMode = DefaultMaterial.RENDERMODE_OPAQUE
	}
	
	/**
	 * 设置渲染模式。
	 * @return 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case DefaultMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case DefaultMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case DefaultMaterial.RENDERMODE_TRANSPARENT:
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
        this._shaderValues.setBool(DefaultMaterial.DEPTH_WRITE, value);
    }

	/**
	 * 获取是否写入深度。
	 * @return 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(DefaultMaterial.DEPTH_WRITE);
    }

	/**
	 * 设置剔除方式。
	 * @param value 剔除方式。
	 */
    set cull(value: number) {
        this._shaderValues.setInt(DefaultMaterial.CULL, value);
    }

	/**
	 * 获取剔除方式。
	 * @return 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(DefaultMaterial.CULL);
    }

	/**
	 * 设置混合方式。
	 * @param value 混合方式。
	 */
    set blend(value: number) {
        this._shaderValues.setInt(DefaultMaterial.BLEND, value);
    }

	/**
	 * 获取混合方式。
	 * @return 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(DefaultMaterial.BLEND);
    }

	/**
	 * 设置混合源。
	 * @param value 混合源
	 */
    set blendSrc(value: number) {
        this._shaderValues.setInt(DefaultMaterial.BLEND_SRC, value);
    }

	/**
	 * 获取混合源。
	 * @return 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(DefaultMaterial.BLEND_SRC);
    }

	/**
	 * 设置混合目标。
	 * @param value 混合目标
	 */
    set blendDst(value: number) {
        this._shaderValues.setInt(DefaultMaterial.BLEND_DST, value);
    }

	/**
	 * 获取混合目标。
	 * @return 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(DefaultMaterial.BLEND_DST);
    }

	/**
	 * 设置深度测试方式。
	 * @param value 深度测试方式
	 */
    set depthTest(value: number) {
        this._shaderValues.setInt(DefaultMaterial.DEPTH_TEST, value);
    }

	/**
	 * 获取深度测试方式。
	 * @return 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(DefaultMaterial.DEPTH_TEST);
	}
	
}