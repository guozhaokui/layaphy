import { Matrix } from "../maths/Matrix";
import { Graphics } from "../display/Graphics";
export class GraphicsAni extends Graphics {
    drawSkin(skinA, alpha) {
        this.drawTriangles(skinA.texture, 0, 0, skinA.vertices, skinA.uvs, skinA.indexes, skinA.transform || Matrix.EMPTY, alpha);
    }
    static create() {
        var rs = GraphicsAni._caches.pop();
        return rs || new GraphicsAni();
    }
    static recycle(graphics) {
        graphics.clear();
        GraphicsAni._caches.push(graphics);
    }
}
GraphicsAni._caches = [];
