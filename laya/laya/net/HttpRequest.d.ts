import { EventDispatcher } from "../events/EventDispatcher";
export declare class HttpRequest extends EventDispatcher {
    protected _http: any;
    protected _responseType: string;
    protected _data: any;
    protected _url: string;
    send(url: string, data?: any, method?: string, responseType?: string, headers?: any[]): void;
    protected _onProgress(e: any): void;
    protected _onAbort(e: any): void;
    protected _onError(e: any): void;
    protected _onLoad(e: any): void;
    protected error(message: string): void;
    protected complete(): void;
    protected clear(): void;
    readonly url: string;
    readonly data: any;
    readonly http: any;
}
