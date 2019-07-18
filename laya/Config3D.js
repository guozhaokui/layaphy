import { Vector3 } from "./laya/d3/math/Vector3";
export class Config3D {
    constructor() {
        this._defaultPhysicsMemory = 16;
        this._editerEnvironment = false;
        this.isAntialias = true;
        this.isAlpha = false;
        this.premultipliedAlpha = true;
        this.isStencil = true;
        this.octreeCulling = false;
        this.octreeInitialSize = 64.0;
        this.octreeInitialCenter = new Vector3(0, 0, 0);
        this.octreeMinNodeSize = 2.0;
        this.octreeLooseness = 1.25;
        this.debugFrustumCulling = false;
    }
    get defaultPhysicsMemory() {
        return this._defaultPhysicsMemory;
    }
    set defaultPhysicsMemory(value) {
        if (value < 16)
            throw "defaultPhysicsMemory must large than 16M";
        this._defaultPhysicsMemory = value;
    }
    cloneTo(dest) {
        var destConfig3D = dest;
        destConfig3D._defaultPhysicsMemory = this._defaultPhysicsMemory;
        destConfig3D._editerEnvironment = this._editerEnvironment;
        destConfig3D.isAntialias = this.isAntialias;
        destConfig3D.isAlpha = this.isAlpha;
        destConfig3D.premultipliedAlpha = this.premultipliedAlpha;
        destConfig3D.isStencil = this.isStencil;
        destConfig3D.octreeCulling = this.octreeCulling;
        this.octreeInitialCenter.cloneTo(destConfig3D.octreeInitialCenter);
        destConfig3D.octreeInitialSize = this.octreeInitialSize;
        destConfig3D.octreeMinNodeSize = this.octreeMinNodeSize;
        destConfig3D.octreeLooseness = this.octreeLooseness;
        destConfig3D.debugFrustumCulling = this.debugFrustumCulling;
    }
    clone() {
        var dest = new Config3D();
        this.cloneTo(dest);
        return dest;
    }
}
Config3D._default = new Config3D();
