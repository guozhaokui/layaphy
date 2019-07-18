import { Component } from "./Component";
export declare class CommonScript extends Component {
    readonly isSingleton: boolean;
    constructor();
    onAwake(): void;
    onEnable(): void;
    onStart(): void;
    onUpdate(): void;
    onLateUpdate(): void;
    onDisable(): void;
    onDestroy(): void;
}
