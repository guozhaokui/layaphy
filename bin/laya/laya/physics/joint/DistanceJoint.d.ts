import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class DistanceJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    selfAnchor: any[];
    otherAnchor: any[];
    collideConnected: boolean;
    private _length;
    private _frequency;
    private _damping;
    protected _createJoint(): void;
    length: number;
    frequency: number;
    damping: number;
}
