import { AccelerationInfo } from "./AccelerationInfo";
import { RotationInfo } from "./RotationInfo";
import { EventDispatcher } from "../../events/EventDispatcher";
import { ILaya } from "../../../ILaya";
import { Event } from "../../events/Event";
export class Accelerator extends EventDispatcher {
    constructor(singleton) {
        super();
        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
    }
    static get instance() {
        Accelerator._instance = Accelerator._instance || new Accelerator(0);
        return Accelerator._instance;
    }
    on(type, caller, listener, args = null) {
        super.on(type, caller, listener, args);
        ILaya.Browser.window.addEventListener('devicemotion', this.onDeviceOrientationChange);
        return this;
    }
    off(type, caller, listener, onceOnly = false) {
        if (!this.hasListener(type))
            ILaya.Browser.window.removeEventListener('devicemotion', this.onDeviceOrientationChange);
        return super.off(type, caller, listener, onceOnly);
    }
    onDeviceOrientationChange(e) {
        var interval = e.interval;
        Accelerator.acceleration.x = e.acceleration.x;
        Accelerator.acceleration.y = e.acceleration.y;
        Accelerator.acceleration.z = e.acceleration.z;
        Accelerator.accelerationIncludingGravity.x = e.accelerationIncludingGravity.x;
        Accelerator.accelerationIncludingGravity.y = e.accelerationIncludingGravity.y;
        Accelerator.accelerationIncludingGravity.z = e.accelerationIncludingGravity.z;
        Accelerator.rotationRate.alpha = e.rotationRate.gamma * -1;
        Accelerator.rotationRate.beta = e.rotationRate.alpha * -1;
        Accelerator.rotationRate.gamma = e.rotationRate.beta;
        if (ILaya.Browser.onAndroid) {
            if (Accelerator.onChrome) {
                Accelerator.rotationRate.alpha *= 180 / Math.PI;
                Accelerator.rotationRate.beta *= 180 / Math.PI;
                Accelerator.rotationRate.gamma *= 180 / Math.PI;
            }
            Accelerator.acceleration.x *= -1;
            Accelerator.accelerationIncludingGravity.x *= -1;
        }
        else if (ILaya.Browser.onIOS) {
            Accelerator.acceleration.y *= -1;
            Accelerator.acceleration.z *= -1;
            Accelerator.accelerationIncludingGravity.y *= -1;
            Accelerator.accelerationIncludingGravity.z *= -1;
            interval *= 1000;
        }
        this.event(Event.CHANGE, [Accelerator.acceleration, Accelerator.accelerationIncludingGravity, Accelerator.rotationRate, interval]);
    }
    static getTransformedAcceleration(acceleration) {
        Accelerator.transformedAcceleration = Accelerator.transformedAcceleration || new AccelerationInfo();
        Accelerator.transformedAcceleration.z = acceleration.z;
        if (ILaya.Browser.window.orientation == 90) {
            Accelerator.transformedAcceleration.x = acceleration.y;
            Accelerator.transformedAcceleration.y = -acceleration.x;
        }
        else if (ILaya.Browser.window.orientation == -90) {
            Accelerator.transformedAcceleration.x = -acceleration.y;
            Accelerator.transformedAcceleration.y = acceleration.x;
        }
        else if (!ILaya.Browser.window.orientation) {
            Accelerator.transformedAcceleration.x = acceleration.x;
            Accelerator.transformedAcceleration.y = acceleration.y;
        }
        else if (ILaya.Browser.window.orientation == 180) {
            Accelerator.transformedAcceleration.x = -acceleration.x;
            Accelerator.transformedAcceleration.y = -acceleration.y;
        }
        var tx;
        if (ILaya.stage.canvasDegree == -90) {
            tx = Accelerator.transformedAcceleration.x;
            Accelerator.transformedAcceleration.x = -Accelerator.transformedAcceleration.y;
            Accelerator.transformedAcceleration.y = tx;
        }
        else if (ILaya.stage.canvasDegree == 90) {
            tx = Accelerator.transformedAcceleration.x;
            Accelerator.transformedAcceleration.x = Accelerator.transformedAcceleration.y;
            Accelerator.transformedAcceleration.y = -tx;
        }
        return Accelerator.transformedAcceleration;
    }
}
Accelerator.acceleration = new AccelerationInfo();
Accelerator.accelerationIncludingGravity = new AccelerationInfo();
Accelerator.rotationRate = new RotationInfo();
Accelerator.onChrome = (ILaya.Browser.userAgent.indexOf("Chrome") > -1);
