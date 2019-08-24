import { FrameOverTime } from "./FrameOverTime";
import { StartFrame } from "./StartFrame";
import { Vector2 } from "../../../math/Vector2";
export class TextureSheetAnimation {
    constructor(frame, startFrame) {
        this.type = 0;
        this.randomRow = false;
        this.rowIndex = 0;
        this.cycles = 0;
        this.enableUVChannels = 0;
        this.enable = false;
        this.tiles = new Vector2(1, 1);
        this.type = 0;
        this.randomRow = true;
        this.rowIndex = 0;
        this.cycles = 1;
        this.enableUVChannels = 1;
        this._frame = frame;
        this._startFrame = startFrame;
    }
    get frame() {
        return this._frame;
    }
    get startFrame() {
        return this._startFrame;
    }
    cloneTo(destObject) {
        var destTextureSheetAnimation = destObject;
        this.tiles.cloneTo(destTextureSheetAnimation.tiles);
        destTextureSheetAnimation.type = this.type;
        destTextureSheetAnimation.randomRow = this.randomRow;
        this._frame.cloneTo(destTextureSheetAnimation._frame);
        this._startFrame.cloneTo(destTextureSheetAnimation._startFrame);
        destTextureSheetAnimation.cycles = this.cycles;
        destTextureSheetAnimation.enableUVChannels = this.enableUVChannels;
        destTextureSheetAnimation.enable = this.enable;
    }
    clone() {
        var destFrame;
        switch (this._frame.type) {
            case 0:
                destFrame = FrameOverTime.createByConstant(this._frame.constant);
                break;
            case 1:
                destFrame = FrameOverTime.createByOverTime(this._frame.frameOverTimeData.clone());
                break;
            case 2:
                destFrame = FrameOverTime.createByRandomTwoConstant(this._frame.constantMin, this._frame.constantMax);
                break;
            case 3:
                destFrame = FrameOverTime.createByRandomTwoOverTime(this._frame.frameOverTimeDataMin.clone(), this._frame.frameOverTimeDataMax.clone());
                break;
        }
        var destStartFrame;
        switch (this._startFrame.type) {
            case 0:
                destStartFrame = StartFrame.createByConstant(this._startFrame.constant);
                break;
            case 1:
                destStartFrame = StartFrame.createByRandomTwoConstant(this._startFrame.constantMin, this._startFrame.constantMax);
                break;
        }
        var destTextureSheetAnimation = new TextureSheetAnimation(destFrame, destStartFrame);
        this.tiles.cloneTo(destTextureSheetAnimation.tiles);
        destTextureSheetAnimation.type = this.type;
        destTextureSheetAnimation.randomRow = this.randomRow;
        destTextureSheetAnimation.cycles = this.cycles;
        destTextureSheetAnimation.enableUVChannels = this.enableUVChannels;
        destTextureSheetAnimation.enable = this.enable;
        return destTextureSheetAnimation;
    }
}
