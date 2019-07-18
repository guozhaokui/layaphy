import { Accelerator } from "./motion/Accelerator";
import { EventDispatcher } from "../events/EventDispatcher";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
export class Shake extends EventDispatcher {
    constructor() {
        super();
    }
    static get instance() {
        Shake._instance = Shake._instance || new Shake();
        return Shake._instance;
    }
    start(throushold, interval) {
        this.throushold = throushold;
        this.shakeInterval = interval;
        this.lastX = this.lastY = this.lastZ = NaN;
        Accelerator.instance.on(Event.CHANGE, this, this.onShake);
    }
    stop() {
        Accelerator.instance.off(Event.CHANGE, this, this.onShake);
    }
    onShake(acceleration, accelerationIncludingGravity, rotationRate, interval) {
        if (isNaN(this.lastX)) {
            this.lastX = accelerationIncludingGravity.x;
            this.lastY = accelerationIncludingGravity.y;
            this.lastZ = accelerationIncludingGravity.z;
            this.lastMillSecond = ILaya.Browser.now();
            return;
        }
        var deltaX = Math.abs(this.lastX - accelerationIncludingGravity.x);
        var deltaY = Math.abs(this.lastY - accelerationIncludingGravity.y);
        var deltaZ = Math.abs(this.lastZ - accelerationIncludingGravity.z);
        if (this.isShaked(deltaX, deltaY, deltaZ)) {
            var deltaMillSecond = ILaya.Browser.now() - this.lastMillSecond;
            if (deltaMillSecond > this.shakeInterval) {
                this.event(Event.CHANGE);
                this.lastMillSecond = ILaya.Browser.now();
            }
        }
        this.lastX = accelerationIncludingGravity.x;
        this.lastY = accelerationIncludingGravity.y;
        this.lastZ = accelerationIncludingGravity.z;
    }
    isShaked(deltaX, deltaY, deltaZ) {
        return (deltaX > this.throushold && deltaY > this.throushold) ||
            (deltaX > this.throushold && deltaZ > this.throushold) ||
            (deltaY > this.throushold && deltaZ > this.throushold);
    }
}
