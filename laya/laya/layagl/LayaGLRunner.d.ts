import { CommandEncoder } from "./CommandEncoder";
import { LayaGL } from "./LayaGL";
export declare class LayaGLRunner {
    static uploadShaderUniforms(layaGL: LayaGL, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number;
    static uploadCustomUniform(layaGL: LayaGL, custom: any[], index: number, data: any): number;
    static uploadShaderUniformsForNative(layaGL: any, commandEncoder: CommandEncoder, shaderData: any): number;
}
