import { JointBase } from "./JointBase";
export declare class GearJoint extends JointBase {
    private static _temp;
    joint1: any;
    joint2: any;
    collideConnected: boolean;
    private _ratio;
    protected _createJoint(): void;
    ratio: number;
}
