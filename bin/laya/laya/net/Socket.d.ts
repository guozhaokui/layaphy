import { EventDispatcher } from "../events/EventDispatcher";
export declare class Socket extends EventDispatcher {
    static LITTLE_ENDIAN: string;
    static BIG_ENDIAN: string;
    protected _socket: any;
    private _connected;
    private _addInputPosition;
    private _input;
    private _output;
    disableInput: boolean;
    private _byteClass;
    protocols: any;
    readonly input: any;
    readonly output: any;
    readonly connected: boolean;
    endian: string;
    constructor(host?: string, port?: number, byteClass?: new () => any, protocols?: any[]);
    connect(host: string, port: number): void;
    connectByUrl(url: string): void;
    cleanSocket(): void;
    close(): void;
    protected _onOpen(e: any): void;
    protected _onMessage(msg: any): void;
    protected _onClose(e: any): void;
    protected _onError(e: any): void;
    send(data: any): void;
    flush(): void;
}
