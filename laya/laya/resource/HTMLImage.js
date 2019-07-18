import { Bitmap } from "./Bitmap";
import { Texture2D } from "./Texture2D";
import { BaseTexture } from "./BaseTexture";
export class HTMLImage extends Bitmap {
}
HTMLImage.create = function (width, height, format) {
    var tex = new Texture2D(width, height, format, false, false);
    tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
    tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
    return tex;
};
