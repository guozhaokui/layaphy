import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody";
export declare class WeldJoint extends JointBase {
    private static _temp;
    selfBody: RigidBody;
    otherBody: RigidBody;
    anchor: any[];
    collideConnected: boolean;
    private _frequency;
    private _damping;
    protected _createJoint(): void;
    frequency: number;
    damping: number;
}
