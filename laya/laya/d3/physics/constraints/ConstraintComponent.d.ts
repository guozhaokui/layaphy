import { Component } from "../../../components/Component";
import { Rigidbody3D } from "../Rigidbody3D";
export declare class ConstraintComponent extends Component {
    enabled: boolean;
    breakingImpulseThreshold: number;
    readonly appliedImpulse: number;
    connectedBody: Rigidbody3D;
    constructor();
    protected _onDestroy(): void;
}
