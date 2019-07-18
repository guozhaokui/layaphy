import { Matrix4x4 } from "./Matrix4x4";
import { Vector3 } from "./Vector3";
export class Viewport {
    constructor(x, y, width, height) {
        this.minDepth = 0.0;
        this.maxDepth = 1.0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    project(source, matrix, out) {
        Vector3.transformV3ToV3(source, matrix, out);
        var matrixEleme = matrix.elements;
        var a = (((source.x * matrixEleme[3]) + (source.y * matrixEleme[7])) + (source.z * matrixEleme[11])) + matrixEleme[15];
        if (a !== 1.0) {
            out.x = out.x / a;
            out.y = out.y / a;
            out.z = out.z / a;
        }
        out.x = (((out.x + 1.0) * 0.5) * this.width) + this.x;
        out.y = (((-out.y + 1.0) * 0.5) * this.height) + this.y;
        out.z = (out.z * (this.maxDepth - this.minDepth)) + this.minDepth;
    }
    unprojectFromMat(source, matrix, out) {
        var matrixEleme = matrix.elements;
        out.x = (((source.x - this.x) / (this.width)) * 2.0) - 1.0;
        out.y = -((((source.y - this.y) / (this.height)) * 2.0) - 1.0);
        var halfDepth = (this.maxDepth - this.minDepth) / 2;
        out.z = (source.z - this.minDepth - halfDepth) / halfDepth;
        var a = (((out.x * matrixEleme[3]) + (out.y * matrixEleme[7])) + (out.z * matrixEleme[11])) + matrixEleme[15];
        Vector3.transformV3ToV3(out, matrix, out);
        if (a !== 1.0) {
            out.x = out.x / a;
            out.y = out.y / a;
            out.z = out.z / a;
        }
    }
    unprojectFromWVP(source, projection, view, world, out) {
        Matrix4x4.multiply(projection, view, Viewport._tempMatrix4x4);
        (world) && (Matrix4x4.multiply(Viewport._tempMatrix4x4, world, Viewport._tempMatrix4x4));
        Viewport._tempMatrix4x4.invert(Viewport._tempMatrix4x4);
        this.unprojectFromMat(source, Viewport._tempMatrix4x4, out);
    }
    cloneTo(out) {
        out.x = this.x;
        out.y = this.y;
        out.width = this.width;
        out.height = this.height;
        out.minDepth = this.minDepth;
        out.maxDepth = this.maxDepth;
    }
}
Viewport._tempMatrix4x4 = new Matrix4x4();
