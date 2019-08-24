import { Component } from "../../components/Component";
export declare class JointBase extends Component {
    protected _joint: any;
    readonly joint: any;
    protected _onEnable(): void;
    protected _onAwake(): void;
    protected _createJoint(): void;
    protected _onDisable(): void;
}
