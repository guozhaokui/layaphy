import { BaseShape } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { Vector3 } from "../../../../math/Vector3";
export class HemisphereShape extends BaseShape {
    constructor() {
        super();
        this.radius = 1.0;
        this.emitFromShell = false;
        this.randomDirection = false;
    }
    _getShapeBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = min.y = min.z = -this.radius;
        var max = boundBox.max;
        max.x = max.y = this.radius;
        max.z = 0;
    }
    _getSpeedBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = min.y = -1;
        min.z = 0;
        var max = boundBox.max;
        max.x = max.y = max.z = 1;
    }
    generatePositionAndDirection(position, direction, rand = null, randomSeeds = null) {
        if (rand) {
            rand.seed = randomSeeds[16];
            if (this.emitFromShell)
                ShapeUtils._randomPointUnitSphere(position, rand);
            else
                ShapeUtils._randomPointInsideUnitSphere(position, rand);
            randomSeeds[16] = rand.seed;
        }
        else {
            if (this.emitFromShell)
                ShapeUtils._randomPointUnitSphere(position);
            else
                ShapeUtils._randomPointInsideUnitSphere(position);
        }
        Vector3.scale(position, this.radius, position);
        var z = position.z;
        (z < 0.0) && (position.z = z * -1.0);
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
            position.cloneTo(direction);
        }
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destShape = destObject;
        destShape.radius = this.radius;
        destShape.emitFromShell = this.emitFromShell;
        destShape.randomDirection = this.randomDirection;
    }
}
