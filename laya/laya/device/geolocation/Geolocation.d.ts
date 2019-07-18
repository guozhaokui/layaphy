import { Handler } from "../../utils/Handler";
export declare class Geolocation {
    private static navigator;
    private static position;
    static PERMISSION_DENIED: number;
    static POSITION_UNAVAILABLE: number;
    static TIMEOUT: number;
    static supported: boolean;
    static enableHighAccuracy: boolean;
    static timeout: number;
    static maximumAge: number;
    constructor();
    static getCurrentPosition(onSuccess: Handler, onError?: Handler): void;
    static watchPosition(onSuccess: Handler, onError: Handler): number;
    static clearWatch(id: number): void;
}
