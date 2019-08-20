import { Scene3D } from "laya/d3/core/scene/Scene3D";
import World from "../world/World";
import { PixelLineRenderer } from "laya/d3/core/pixelLine/PixelLineRenderer";
import Shape, { SHAPETYPE } from "../shapes/Shape";

/**
 * 渲染物理线框
 */
export class PhyRender {
    sce: Scene3D;
    phyworld: World;
    drawAllShape = true;
    constructor(sce: Scene3D, world: World) {
        this.sce = sce;
        this.phyworld = world;
    }

    update() {
        // 坐标轴

        // 所有的body的所有的shape
        // sleep的要偏暗

        // 所有的碰撞点，碰撞法线

        // body的私有信息

    }

    createMesh(shape: Shape) {
        switch (shape.type) {
            case SHAPETYPE.BOX:
                break;
            case SHAPETYPE.SPHERE:
                break;
            case SHAPETYPE.PLANE:
                break;
            case SHAPETYPE.CYLINDER:
                break;
            case SHAPETYPE.CAPSULE:
                break;
            case SHAPETYPE.CONVEXPOLYHEDRON:
                break;
            case SHAPETYPE.COMPOUND:
                break;
            case SHAPETYPE.HEIGHTFIELD:
                break;
            case SHAPETYPE.TRIMESH:
                break;
        }
    }
}

