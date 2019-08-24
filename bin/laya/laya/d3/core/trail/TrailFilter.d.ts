import { Vector3 } from "../../math/Vector3";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { TrailSprite3D } from "./TrailSprite3D";
export declare class TrailFilter {
    static CURTIME: number;
    static LIFETIME: number;
    static WIDTHCURVE: number;
    static WIDTHCURVEKEYLENGTH: number;
    _owner: TrailSprite3D;
    _lastPosition: Vector3;
    _curtime: number;
    alignment: number;
    time: number;
    minVertexDistance: number;
    widthMultiplier: number;
    widthCurve: FloatKeyframe[];
    colorGradient: Gradient;
    textureMode: number;
    constructor(owner: TrailSprite3D);
    static ALIGNMENT_VIEW: number;
    static ALIGNMENT_TRANSFORM_Z: number;
}
