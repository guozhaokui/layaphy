import { ShaderPass } from "./ShaderPass";
import { ShaderDefines } from "./ShaderDefines";
export declare class SubShader {
    constructor(attributeMap: any, uniformMap: any, spriteDefines?: ShaderDefines, materialDefines?: ShaderDefines);
    getMaterialDefineByName(name: string): number;
    setFlag(key: string, value: string): void;
    getFlag(key: string): string;
    addShaderPass(vs: string, ps: string, stateMap?: any): ShaderPass;
}
