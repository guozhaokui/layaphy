import { Handler } from "../utils/Handler";
export declare class AtlasInfoManager {
    private static _fileLoadDic;
    static enable(infoFile: string, callback?: Handler): void;
    private static _onInfoLoaded;
    static getFileLoadPath(file: string): string;
}
