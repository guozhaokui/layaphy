import { Camera } from "../Camera";
import { CommandBuffer } from "./command/CommandBuffer";
import { RenderTexture } from "../../resource/RenderTexture";
import { ShaderData } from "../../shader/ShaderData";
export declare class PostProcessRenderContext {
    source: RenderTexture;
    destination: RenderTexture;
    camera: Camera;
    compositeShaderData: ShaderData;
    command: CommandBuffer;
    deferredReleaseTextures: RenderTexture[];
}
