import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class MotorJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    collideConnected: boolean;
    private _linearOffset;
    private _angularOffset;
    private _maxForce;
    private _maxTorque;
    private _correctionFactor;
    protected _createJoint(): void;
    linearOffset: any[];
    angularOffset: number;
    maxForce: number;
    maxTorque: number;
    correctionFactor: number;
}
