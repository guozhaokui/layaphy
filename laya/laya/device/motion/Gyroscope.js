import { RotationInfo } from "./RotationInfo";
import { EventDispatcher } from "../../events/EventDispatcher";
import { ILaya } from "../../../ILaya";
import { Event } from "../../events/Event";
export class Gyroscope extends EventDispatcher {
    constructor(singleton) {
        super();
        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
    }
    static get instance() {
        Gyroscope._instance = Gyroscope._instance || new Gyroscope(0);
        return Gyroscope._instance;
    }
    on(type, caller, listener, args = null) {
        super.on(type, caller, listener, args);
        ILaya.Browser.window.addEventListener('deviceorientation', this.onDeviceOrientationChange);
        return this;
    }
    off(type, caller, listener, onceOnly = false) {
        if (!this.hasListener(type))
            ILaya.Browser.window.removeEventListener('deviceorientation', this.onDeviceOrientationChange);
        return super.off(type, caller, listener, onceOnly);
    }
    onDeviceOrientationChange(e) {
        Gyroscope.info.alpha = e.alpha;
        Gyroscope.info.beta = e.beta;
        Gyroscope.info.gamma = e.gamma;
        if (e.webkitCompassHeading) {
            Gyroscope.info.alpha = e.webkitCompassHeading * -1;
            Gyroscope.info.compassAccuracy = e.webkitCompassAccuracy;
        }
        this.event(Event.CHANGE, [e.absolute, Gyroscope.info]);
    }
}
Gyroscope.info = new RotationInfo();
