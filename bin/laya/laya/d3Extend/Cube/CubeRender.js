import { Sprite3D } from "laya/d3/core/Sprite3D";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
export class CubeRender extends BaseRender {
    constructor(owner) {
        super(owner, 4);
        this._projectionViewWorldMatrix = new Matrix4x4();
    }
    _calculateBoundingSphere() {
        this._boundingSphere.radius = Number.MAX_VALUE;
    }
    _renderUpdate(context, transform) {
        if (transform)
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
        else
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
    }
    _renderUpdateWithCamera(context, transform) {
        var projectionView = context.projectionViewMatrix;
        if (transform) {
            Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
        }
        else {
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
        }
    }
    _destroy() {
    }
}
