import { Component } from "../../components/Component";
import { Collision } from "../physics/Collision";
import { PhysicsComponent } from "../physics/PhysicsComponent";
import { Event } from "../../events/Event";
export declare class Script3D extends Component {
    readonly isSingleton: boolean;
    private _checkProcessTriggers;
    private _checkProcessCollisions;
    protected _onAwake(): void;
    protected _onEnable(): void;
    protected _onDisable(): void;
    _isScript(): boolean;
    _onAdded(): void;
    protected _onDestroy(): void;
    onAwake(): void;
    onEnable(): void;
    onStart(): void;
    onTriggerEnter(other: PhysicsComponent): void;
    onTriggerStay(other: PhysicsComponent): void;
    onTriggerExit(other: PhysicsComponent): void;
    onCollisionEnter(collision: Collision): void;
    onCollisionStay(collision: Collision): void;
    onCollisionExit(collision: Collision): void;
    onMouseDown(): void;
    onMouseDrag(): void;
    onMouseClick(): void;
    onMouseUp(): void;
    onMouseEnter(): void;
    onMouseOver(): void;
    onMouseOut(): void;
    onKeyDown(e: Event): void;
    onKeyPress(e: Event): void;
    onKeyUp(e: Event): void;
    onUpdate(): void;
    onLateUpdate(): void;
    onPreRender(): void;
    onPostRender(): void;
    onDisable(): void;
    onDestroy(): void;
}
