import { Touch } from "./Touch";
export declare class Input3D {
    touchCount(): number;
    multiTouchEnabled: boolean;
    getTouch(index: number): Touch;
}
