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
    static DIFFUSETEXTURE: number =  Shader3D.propertyNameToID("u_texture");
    static SHADERDEFINE_SELFDEPTH: ShaderDefine;
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
    }
}