export class Keyframe {
    constructor() {
    }
    cloneTo(destObject) {
        var destKeyFrame = destObject;
        destKeyFrame.time = this.time;
    }
    clone() {
        var dest = new Keyframe();
        this.cloneTo(dest);
        return dest;
    }
}
