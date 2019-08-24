import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
export declare class CommandBuffer {
    constructor();
    blitScreenQuad(source: BaseTexture, dest: RenderTexture, shader?: Shader3D, shaderData?: ShaderData, subShader?: number): void;
    blitScreenTriangle(source: BaseTexture, dest: RenderTexture, shader?: Shader3D, shaderData?: ShaderData, subShader?: number): void;
}
