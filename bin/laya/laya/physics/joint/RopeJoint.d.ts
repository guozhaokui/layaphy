import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class RopeJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    selfAnchor: any[];
    otherAnchor: any[];
    collideConnected: boolean;
    private _maxLength;
    protected _createJoint(): void;
    maxLength: number;
}
