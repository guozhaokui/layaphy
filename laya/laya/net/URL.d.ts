export declare class URL {
    static version: any;
    private _url;
    private _path;
    static exportSceneToJson: boolean;
    constructor(url: string);
    readonly url: string;
    readonly path: string;
    static _basePath: string;
    static rootPath: string;
    static basePath: string;
    static customFormat: Function;
    static formatURL(url: string): string;
    static getPath(url: string): string;
    static getFileName(url: string): string;
    private static _adpteTypeList;
    static getAdptedFilePath(url: string): string;
}
