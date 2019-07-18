import { RigidBody } from "./RigidBody";
import { Component } from "../components/Component";
export declare class ColliderBase extends Component {
    private _isSensor;
    private _density;
    private _friction;
    private _restitution;
    label: string;
    protected _shape: any;
    protected _def: any;
    fixture: any;
    rigidBody: RigidBody;
    protected getDef(): any;
    protected _onEnable(): void;
    private _checkRigidBody;
    protected _onDestroy(): void;
    isSensor: boolean;
    density: number;
    friction: number;
    restitution: number;
    refresh(): void;
    resetShape(re?: boolean): void;
    readonly isSingleton: boolean;
}
