import { BoundsOctree } from "laya/d3/core/scene/BoundsOctree";
import { BoundBox } from "laya/d3/math/BoundBox";
import { BoundSphere } from "laya/d3/math/BoundSphere";
import { Vector3 } from "laya/d3/math/Vector3";
import { TriggerManager } from "./triggerEventDistributedModule/D_manager/TriggerManager";
import { GlobalOnlyValueCell } from "./triggerEventDistributedModule/E_function/cell/GlobalOnlyValueCell";
import { Script } from "laya/components/Script";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
export class CubePhysicsCompnent extends Script {
    constructor() {
        super();
        this.isRigebody = false;
        this._boundBox = new BoundBox(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        this._boundSpheres = new BoundSphere(new Vector3(0, 0, 0), 0);
        this._indexInOctreeMotionList = -1;
    }
    isCollision(other) {
        return 0;
    }
    static updataBoundBox() {
        CubePhysicsCompnent.boundBox.setCenterAndExtent(CubePhysicsCompnent.centerSprite, CubePhysicsCompnent.extents);
    }
    static findAllMesh(sprite, Mesharray, renderspriteArray) {
        var tempMesh;
        var childsprite;
        if (!Mesharray)
            Mesharray = [];
        if (sprite instanceof Sprite3D) {
            if (sprite instanceof MeshSprite3D) {
                tempMesh = (sprite).meshFilter.sharedMesh;
                if (tempMesh)
                    Mesharray.push(tempMesh);
                renderspriteArray.push(sprite);
                if ((sprite).numChildren != 0) {
                    for (var i = 0; i < sprite.numChildren; i++) {
                        childsprite = (sprite).getChildAt(i);
                        CubePhysicsCompnent.findAllMesh(childsprite, Mesharray, renderspriteArray);
                    }
                }
            }
            else if (sprite instanceof SkinnedMeshSprite3D) {
                tempMesh = (sprite).meshFilter.sharedMesh;
                if (tempMesh)
                    Mesharray.push(tempMesh);
                renderspriteArray.push(sprite);
                if ((sprite).numChildren != 0) {
                    for (var j = 0; j < sprite.numChildren; j++) {
                        childsprite = sprite.getChildAt(j);
                        CubePhysicsCompnent.findAllMesh(childsprite, Mesharray, renderspriteArray);
                    }
                }
            }
            else {
                if ((sprite).numChildren != 0) {
                    for (var k = 0; k < sprite.numChildren; k++) {
                        childsprite = sprite.getChildAt(k);
                        CubePhysicsCompnent.findAllMesh(childsprite, Mesharray, renderspriteArray);
                    }
                }
            }
        }
    }
    _getOctreeNode() {
        return this._octreeNode;
    }
    _setOctreeNode(value) {
        this._octreeNode = value;
    }
    _getIndexInMotionList() {
        return this._indexInOctreeMotionList;
    }
    _setIndexInMotionList(value) {
        this._indexInOctreeMotionList = value;
    }
    get boundingSphere() {
        return this._boundSpheres;
    }
    get boundingBox() {
        return this._boundBox;
    }
    static isBoundsCollision(Physics1, Physics2) {
        if (!Physics1._octreeNode.isCollidingWithBoundBox(CubePhysicsCompnent.boundBox))
            return false;
        else if (!Physics2._octreeNode.isCollidingWithBoundBox(CubePhysicsCompnent.boundBox))
            return false;
        else
            return true;
    }
    onAwake() {
        super.onAwake();
        this.onlyID = GlobalOnlyValueCell.getOnlyID();
    }
    onEnable() {
        super.onEnable();
        if (this.isStatic) {
            TriggerManager.instance.addStatic(this);
        }
        else {
        }
    }
    onDisable() {
        super.onDisable();
        if (this.isStatic) {
            TriggerManager.instance.removeStatic(this);
        }
        else {
            TriggerManager.instance.removeDY(this);
        }
    }
    onDestroy() {
        if (this.isStatic) {
            TriggerManager.instance.removeStatic(this);
        }
        else {
            TriggerManager.instance.removeDY(this);
        }
        super.onDestroy();
    }
}
CubePhysicsCompnent.TYPE_BOX = 0;
CubePhysicsCompnent.TYPE_SPHERE = 1;
CubePhysicsCompnent.TYPE_CUBESPRIT3D = 2;
CubePhysicsCompnent.centerSprite = new Vector3(0, 0, 0);
CubePhysicsCompnent.extents = new Vector3(8, 8, 8);
CubePhysicsCompnent.boundBox = new BoundBox();
CubePhysicsCompnent._octree = new BoundsOctree(64, new Vector3(0, 0, 0), 4, 1.25);
CubePhysicsCompnent._tempVectormax = new Vector3(0, 0, 0);
CubePhysicsCompnent._tempVectormin = new Vector3(0, 0, 0);
