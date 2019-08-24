import { IDestroy } from "../../resource/IDestroy";
export declare class GeometryElement implements IDestroy {
    readonly destroyed: boolean;
    constructor();
    _getType(): number;
    destroy(): void;
}
