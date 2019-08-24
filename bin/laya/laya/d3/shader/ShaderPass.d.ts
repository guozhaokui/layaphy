import { SubShader } from "./SubShader";
import { RenderState } from "../core/material/RenderState";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
export declare class ShaderPass extends ShaderCompile {
    readonly renderState: RenderState;
    constructor(owner: SubShader, vs: string, ps: string, stateMap: any);
    protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void;
}
