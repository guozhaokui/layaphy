import { Handler } from "../utils/Handler";
export declare class ResourceVersion {
    static FOLDER_VERSION: number;
    static FILENAME_VERSION: number;
    static manifest: any;
    static type: number;
    static enable(manifestFile: string, callback: Handler, type?: number): void;
    private static onManifestLoaded;
    static addVersionPrefix(originURL: string): string;
}
