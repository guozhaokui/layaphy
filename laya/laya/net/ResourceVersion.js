import { Loader } from "./Loader";
import { URL } from "./URL";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
export class ResourceVersion {
    static enable(manifestFile, callback, type = 2) {
        ResourceVersion.type = type;
        ILaya.loader.load(manifestFile, Handler.create(null, ResourceVersion.onManifestLoaded, [callback]), null, Loader.JSON);
        URL.customFormat = ResourceVersion.addVersionPrefix;
    }
    static onManifestLoaded(callback, data) {
        ResourceVersion.manifest = data;
        callback.run();
        if (!data) {
            console.warn("资源版本清单文件不存在，不使用资源版本管理。忽略ERR_FILE_NOT_FOUND错误。");
        }
    }
    static addVersionPrefix(originURL) {
        originURL = URL.getAdptedFilePath(originURL);
        if (ResourceVersion.manifest && ResourceVersion.manifest[originURL]) {
            if (ResourceVersion.type == ResourceVersion.FILENAME_VERSION)
                return ResourceVersion.manifest[originURL];
            return ResourceVersion.manifest[originURL] + "/" + originURL;
        }
        return originURL;
    }
}
ResourceVersion.FOLDER_VERSION = 1;
ResourceVersion.FILENAME_VERSION = 2;
ResourceVersion.type = ResourceVersion.FOLDER_VERSION;
