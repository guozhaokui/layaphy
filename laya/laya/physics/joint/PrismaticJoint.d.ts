import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class PrismaticJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    anchor: any[];
    axis: any[];
    collideConnected: boolean;
    private _enableMotor;
    private _motorSpeed;
    private _maxMotorForce;
    private _enableLimit;
    private _lowerTranslation;
    private _upperTranslation;
    protected _createJoint(): void;
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorForce: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
}
