import { ILaya } from "../../../ILaya";
export class Media {
    constructor() {
    }
    static supported() {
        return !!ILaya.Browser.window.navigator.getUserMedia;
    }
    static getMedia(options, onSuccess, onError) {
        if (ILaya.Browser.window.navigator.getUserMedia) {
            ILaya.Browser.window.navigator.getUserMedia(options, function (stream) {
                onSuccess.runWith(ILaya.Browser.window.URL.createObjectURL(stream));
            }, function (err) {
                onError.runWith(err);
            });
        }
    }
}
