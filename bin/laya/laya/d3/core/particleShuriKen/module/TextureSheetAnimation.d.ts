import { FrameOverTime } from "./FrameOverTime";
import { StartFrame } from "./StartFrame";
import { IClone } from "../../IClone";
import { Vector2 } from "../../../math/Vector2";
export declare class TextureSheetAnimation implements IClone {
    tiles: Vector2;
    type: number;
    randomRow: boolean;
    rowIndex: number;
    cycles: number;
    enableUVChannels: number;
    enable: boolean;
    readonly frame: FrameOverTime;
    readonly startFrame: StartFrame;
    constructor(frame: FrameOverTime, startFrame: StartFrame);
    cloneTo(destObject: any): void;
    clone(): any;
}
