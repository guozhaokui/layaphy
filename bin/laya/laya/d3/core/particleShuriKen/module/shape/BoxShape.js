import { BaseShape } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
export class BoxShape extends BaseShape {
    constructor() {
        super();
        this.x = 1.0;
        this.y = 1.0;
        this.z = 1.0;
        this.randomDirection = false;
    }
    _getShapeBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = -this.x * 0.5;
        min.y = -this.y * 0.5;
        min.z = -this.z * 0.5;
        var max = boundBox.max;
        max.x = this.x * 0.5;
        max.y = this.y * 0.5;
        max.z = this.z * 0.5;
    }
    _getSpeedBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = 0.0;
        min.y = 0.0;
        min.z = 0.0;
        var max = boundBox.max;
        max.x = 0.0;
        max.y = 1.0;
        max.z = 0.0;
    }
    generatePositionAndDirection(position, direction, rand = null, randomSeeds = null) {
        if (rand) {
            rand.seed = randomSeeds[16];
            ShapeUtils._randomPointInsideHalfUnitBox(position, rand);
            randomSeeds[16] = rand.seed;
        }
        else {
            ShapeUtils._randomPointInsideHalfUnitBox(position);
        }
        position.x = this.x * position.x;
        position.y = this.y * position.y;
        position.z = this.z * position.z;
        if (this.randomDirection) {
            if (rand) {
                rand.seed = randomSeeds[17];
                ShapeUtils._randomPointUnitSphere(direction, rand);
                randomSeeds[17] = rand.seed;
            }
            else {
                ShapeUtils._randomPointUnitSphere(direction);
            }
        }
        else {
            direction.x = 0.0;
            direction.y = 0.0;
            direction.z = 1.0;
        }
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destShape = destObject;
        destShape.x = this.x;
        destShape.y = this.y;
        destShape.z = this.z;
        destShape.randomDirection = this.randomDirection;
    }
}
