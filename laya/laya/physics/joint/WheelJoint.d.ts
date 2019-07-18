import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class WheelJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    anchor: any[];
    collideConnected: boolean;
    axis: any[];
    private _frequency;
    private _damping;
    private _enableMotor;
    private _motorSpeed;
    private _maxMotorTorque;
    protected _createJoint(): void;
    frequency: number;
    damping: number;
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
}
