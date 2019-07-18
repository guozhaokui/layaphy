import { Physics3D } from "../Physics3D";
import { ColliderShape } from "./ColliderShape";
export class BoxColliderShape extends ColliderShape {
    static __init__() {
        BoxColliderShape._nativeSize = new Physics3D._physics3D.btVector3(0, 0, 0);
    }
    get sizeX() {
        return this._sizeX;
    }
    get sizeY() {
        return this._sizeY;
    }
    get sizeZ() {
        return this._sizeZ;
    }
    constructor(sizeX = 1.0, sizeY = 1.0, sizeZ = 1.0) {
        super();
        this._sizeX = sizeX;
        this._sizeY = sizeY;
        this._sizeZ = sizeZ;
        this._type = ColliderShape.SHAPETYPES_BOX;
        BoxColliderShape._nativeSize.setValue(sizeX / 2, sizeY / 2, sizeZ / 2);
        this._nativeShape = new Physics3D._physics3D.btBoxShape(BoxColliderShape._nativeSize);
    }
    clone() {
        var dest = new BoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
        this.cloneTo(dest);
        return dest;
    }
}
