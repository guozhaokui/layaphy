import { Vector2 } from "./math/Vector2";
import { ISingletonElement } from "../resource/ISingletonElement";
export declare class Touch implements ISingletonElement {
    private _indexInList;
    readonly identifier: number;
    readonly position: Vector2;
    _getIndexInList(): number;
    _setIndexInList(index: number): void;
}
