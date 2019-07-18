import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class RevoluteJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    anchor: any[];
    collideConnected: boolean;
    private _enableMotor;
    private _motorSpeed;
    private _maxMotorTorque;
    private _enableLimit;
    private _lowerAngle;
    private _upperAngle;
    protected _createJoint(): void;
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    enableLimit: boolean;
    lowerAngle: number;
    upperAngle: number;
}
