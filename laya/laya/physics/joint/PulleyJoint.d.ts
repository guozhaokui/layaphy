import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class PulleyJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    selfAnchor: any[];
    otherAnchor: any[];
    selfGroundPoint: any[];
    otherGroundPoint: any[];
    ratio: number;
    collideConnected: boolean;
    protected _createJoint(): void;
}
