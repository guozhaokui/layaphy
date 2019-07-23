import { GeolocationInfo } from "./GeolocationInfo";
import { ILaya } from "ILaya";
export class Geolocation {
    constructor() {
    }
    static getCurrentPosition(onSuccess, onError = null) {
        Geolocation.navigator.geolocation.getCurrentPosition(function (pos) {
            Geolocation.position.setPosition(pos);
            onSuccess.runWith(Geolocation.position);
        }, function (error) {
            onError.runWith(error);
        }, {
            enableHighAccuracy: Geolocation.enableHighAccuracy,
            timeout: Geolocation.timeout,
            maximumAge: Geolocation.maximumAge
        });
    }
    static watchPosition(onSuccess, onError) {
        return Geolocation.navigator.geolocation.watchPosition(function (pos) {
            Geolocation.position.setPosition(pos);
            onSuccess.runWith(Geolocation.position);
        }, function (error) {
            onError.runWith(error);
        }, {
            enableHighAccuracy: Geolocation.enableHighAccuracy,
            timeout: Geolocation.timeout,
            maximumAge: Geolocation.maximumAge
        });
    }
    static clearWatch(id) {
        Geolocation.navigator.geolocation.clearWatch(id);
    }
}
Geolocation.navigator = ILaya.Browser.window.navigator;
Geolocation.position = new GeolocationInfo();
Geolocation.PERMISSION_DENIED = 1;
Geolocation.POSITION_UNAVAILABLE = 2;
Geolocation.TIMEOUT = 3;
Geolocation.supported = !!Geolocation.navigator.geolocation;
Geolocation.enableHighAccuracy = false;
Geolocation.timeout = 1E10;
Geolocation.maximumAge = 0;
