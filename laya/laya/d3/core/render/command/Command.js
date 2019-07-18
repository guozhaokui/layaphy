import { Shader3D } from "../../../../d3/shader/Shader3D";
import { ShaderData } from "../../../../d3/shader/ShaderData";
export class Command {
    constructor() {
        this._commandBuffer = null;
    }
    static __init__() {
        Command._screenShaderData = new ShaderData();
        Command._screenShader = Shader3D.find("BlitScreen");
    }
    run() {
    }
    recover() {
        this._commandBuffer = null;
    }
}
Command.SCREENTEXTURE_NAME = "u_MainTex";
Command.MAINTEXTURE_TEXELSIZE_NAME = "u_MainTex_TexelSize";
Command.SCREENTEXTURE_ID = Shader3D.propertyNameToID(Command.SCREENTEXTURE_NAME);
Command.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID(Command.MAINTEXTURE_TEXELSIZE_NAME);
