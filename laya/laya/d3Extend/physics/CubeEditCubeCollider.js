import { CubePhysicsCompnent } from "./CubePhysicsCompnent";
import { Vector3 } from "laya/d3/math/Vector3";
export class CubeEditCubeCollider extends CubePhysicsCompnent {
    constructor() {
        super();
        this.data = {};
        this.collisionCube = new Vector3();
        this.cubeProperty = 0;
    }
    onAwake() {
        super.onAwake();
        this.type = CubePhysicsCompnent.TYPE_CUBESPRIT3D;
    }
    dataAdd(x, y, z, color) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key] || (this.data[key] = {});
        o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)] = (this.colorIndex & 0xff000000) >> 24;
    }
    find(x, y, z) {
        var key = (x >> 5) + ((y >> 5) << 8) + ((z >> 5) << 16);
        var o = this.data[key];
        if (o) {
            if (o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)]) {
                return o[x % 32 + ((y % 32) << 8) + ((z % 32) << 16)];
            }
            else {
                return -1;
            }
        }
        return -1;
    }
    clear() {
        for (var i in this.data) {
            this.data[i] = {};
        }
    }
    InitCubemap(cubemap, cubeMeshManager) {
        var vector = cubeMeshManager.transform.position;
        var cubeinfos = cubemap.returnAllCube();
        for (var i = 0, n = cubeinfos.length; i < n; i++) {
            this.dataAdd(cubeinfos[i].x + vector.x, cubeinfos[i].y + vector.y, cubeinfos[i].z + vector.z, cubeinfos[i].color);
        }
    }
    InitCubeInfoArray(cubeinfoArray) {
        var lenth = cubeinfoArray.PositionArray.length / 3;
        var PositionArray = this.cubeInfoArray.PositionArray;
        this.cubeInfoArray.currentColorindex = 0;
        this.cubeInfoArray.currentPosindex = 0;
        for (var i = 0; i < lenth; i++) {
            var x = PositionArray[this.cubeInfoArray.currentPosindex] + this.cubeInfoArray.dx + 1600;
            var y = PositionArray[this.cubeInfoArray.currentPosindex + 1] + this.cubeInfoArray.dy + 1600;
            var z = PositionArray[this.cubeInfoArray.currentPosindex + 2] + this.cubeInfoArray.dz + 1600;
            var color = this.cubeInfoArray.colorArray[this.cubeInfoArray.currentColorindex];
            this.cubeInfoArray.currentPosindex += 3;
            this.cubeInfoArray.currentColorindex++;
            this.dataAdd(x, y, z, color);
        }
    }
    isCollision(other) {
        switch (other.type) {
            case 0:
                return (other).boxAndCube(this);
                break;
            case 1:
                return (other).sphereAndCube(this);
                break;
            case 2:
                return 999;
                break;
            default:
                return 999;
        }
    }
}
