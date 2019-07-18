export declare class Handler {
    protected static _pool: any[];
    private static _gid;
    caller: any;
    method: Function;
    args: any[];
    once: boolean;
    protected _id: number;
    constructor(caller?: any, method?: Function, args?: any[], once?: boolean);
    setTo(caller: any, method: Function, args: any[], once: boolean): Handler;
    run(): any;
    runWith(data: any): any;
    clear(): Handler;
    recover(): void;
    static create(caller: any, method: Function, args?: any[], once?: boolean): Handler;
}
