import { Node } from "../display/Node";
import { IDestroy } from "../resource/IDestroy";
import { ISingletonElement } from "../resource/ISingletonElement";
export declare class Component implements ISingletonElement, IDestroy {
    private _indexInList;
    private _awaked;
    owner: Node;
    constructor();
    readonly id: number;
    enabled: boolean;
    readonly isSingleton: boolean;
    readonly destroyed: boolean;
    private _resetComp;
    _getIndexInList(): number;
    _setIndexInList(index: number): void;
    protected _onAwake(): void;
    protected _onEnable(): void;
    protected _onDisable(): void;
    protected _onDestroy(): void;
    onReset(): void;
    destroy(): void;
}
