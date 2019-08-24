import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class MouseJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    anchor: any[];
    private _maxForce;
    private _frequency;
    private _damping;
    protected _onEnable(): void;
    protected _onAwake(): void;
    private onMouseDown;
    protected _createJoint(): void;
    private onStageMouseUp;
    private onMouseMove;
    protected _onDisable(): void;
    maxForce: number;
    frequency: number;
    damping: number;
}
