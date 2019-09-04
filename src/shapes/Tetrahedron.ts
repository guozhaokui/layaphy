import Vec3 from "../math/Vec3";
import Mat3 from "../math/Mat3";

/**
 * 三维空间最简形
 */
var tmpMat3 = new Mat3();
export class Tetrahedron {
    //verts: Vec3[] = [new Vec3(), new Vec3(), new Vec3(), new Vec3()];   // 四个顶点
    v0 = new Vec3();
    v1 = new Vec3();
    v2 = new Vec3();
    v3 = new Vec3();
    invA:Mat3 = new Mat3();
    constructor(v0:Vec3,v1:Vec3,v2:Vec3,v3:Vec3){
        let e = tmpMat3.elements;
        e[0]=v1.x-v0.x; e[1] = v2.x-v0.x; e[2] = v3.x-v0.x;
        e[3]=v1.y-v0.y; e[4] = v2.y-v0.y; e[5] = v3.y-v0.y;
        e[6]=v1.z-v0.z; e[7] = v2.z-v0.z; e[8] = v3.z-v0.z;
        tmpMat3.reverse(this.invA); // TODO 修改reverse的实现
        this.v0=v0;
        this.v1=v1;
        this.v2=v2;
        this.v3=v3;
    }

    barycentricCoord(x: f32, y: f32, z: f32, out: Vec3): Vec3 {
        let v0 = this.v0;
        let dx = x-v0.x;
        let dy = y-v0.y;
        let dz = z-v0.z;
        out.set(dx,dy,dz);
        this.invA.vmult(out,out);   //TODO 这里可能不对
        return out;
    }
}