import { SkyMesh } from "./SkyMesh";
export declare class SkyDome extends SkyMesh {
    static instance: SkyDome;
    readonly stacks: number;
    readonly slices: number;
    constructor(stacks?: number, slices?: number);
}
