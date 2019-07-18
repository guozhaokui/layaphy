import { Handler } from "../../utils/Handler";
export declare class Media {
    constructor();
    static supported(): boolean;
    static getMedia(options: any, onSuccess: Handler, onError: Handler): void;
}
