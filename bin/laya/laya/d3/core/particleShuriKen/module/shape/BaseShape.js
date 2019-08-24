import { BoundBox } from "../../../../math/BoundBox";
import { Vector3 } from "../../../../math/Vector3";
export class BaseShape {
    constructor() {
    }
    _getShapeBoundBox(boundBox) {
        throw new Error("BaseShape: must override it.");
    }
    _getSpeedBoundBox(boundBox) {
        throw new Error("BaseShape: must override it.");
    }
    generatePositionAndDirection(position, direction, rand = null, randomSeeds = null) {
        throw new Error("BaseShape: must override it.");
    }
    _calculateProceduralBounds(boundBox, emitterPosScale, minMaxBounds) {
        this._getShapeBoundBox(boundBox);
        var min = boundBox.min;
        var max = boundBox.max;
        Vector3.multiply(min, emitterPosScale, min);
        Vector3.multiply(max, emitterPosScale, max);
        var speedBounds = new BoundBox(new Vector3(), new Vector3());
        if (this.randomDirection) {
            speedBounds.min = new Vector3(-1, -1, -1);
            speedBounds.max = new Vector3(1, 1, 1);
        }
        else {
            this._getSpeedBoundBox(speedBounds);
        }
        var maxSpeedBound = new BoundBox(new Vector3(), new Vector3());
        var maxSpeedMin = maxSpeedBound.min;
        var maxSpeedMax = maxSpeedBound.max;
        Vector3.scale(speedBounds.min, minMaxBounds.y, maxSpeedMin);
        Vector3.scale(speedBounds.max, minMaxBounds.y, maxSpeedMax);
        Vector3.add(boundBox.min, maxSpeedMin, maxSpeedMin);
        Vector3.add(boundBox.max, maxSpeedMax, maxSpeedMax);
        Vector3.min(boundBox.min, maxSpeedMin, boundBox.min);
        Vector3.max(boundBox.max, maxSpeedMin, boundBox.max);
        var minSpeedBound = new BoundBox(new Vector3(), new Vector3());
        var minSpeedMin = minSpeedBound.min;
        var minSpeedMax = minSpeedBound.max;
        Vector3.scale(speedBounds.min, minMaxBounds.x, minSpeedMin);
        Vector3.scale(speedBounds.max, minMaxBounds.x, minSpeedMax);
        Vector3.min(minSpeedBound.min, minSpeedMax, maxSpeedMin);
        Vector3.max(minSpeedBound.min, minSpeedMax, maxSpeedMax);
        Vector3.min(boundBox.min, maxSpeedMin, boundBox.min);
        Vector3.max(boundBox.max, maxSpeedMin, boundBox.max);
    }
    cloneTo(destObject) {
        var destShape = destObject;
        destShape.enable = this.enable;
    }
    clone() {
        var destShape = new BaseShape();
        this.cloneTo(destShape);
        return destShape;
    }
}
