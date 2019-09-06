import { VoxelLightRay } from "./VoxelLightRay";

/**
 * 包含若干条光线的球
 */
export class VoxelLightSphere {
    rays: VoxelLightRay[] = [];	// 这是一个n条光线的数组。
    rayNum = 0;
    raysContrib: number[] = [0, 0, 0, 0, 0, 0]; 	//采样线对各个面的贡献

    constructor(rayNum: int, radius: int) {
        this.raysContrib.fill(0);
        this.rayNum = rayNum;
        var rayends = this.pointsOnSphere(rayNum, radius);
        var ri: int = 0, x: number, y: number, z: number;
        for (var i = 0; i < rayNum; i++) {
            x = rayends[ri++];
            y = rayends[ri++];
            z = rayends[ri++];
            var ray = VoxelLightRay.creatLightLine(x|0, y|0, z|0);
            this.rays.push(ray);
            for (var fi: int = 0; fi < 6; fi++) {
                this.raysContrib[fi] += ray.faceLight[fi];
            }
        }
    }

    /**
     * http://www.softimageblog.com/archives/115
     * 返回球上均匀分布的点
     * @param	num		采样点的个数
     * @param	radius
     * @return  返回一个包含xyz的数组
     */
    pointsOnSphere(num: i32, radius = 1.0): number[] {
        var inc: number, off: number, i: u32, y: number, r:number, phi: number;
        let pts = new Array<number>(num * 3);
        inc = Math.PI * (3 - Math.sqrt(5));
        off = 2 / num;
        i = num;
        for (i = 0; i < num; i++) {
            y = i * off - 1 + (off / 2);
            r = Math.sqrt(1 - y * y);
            phi = i * inc;
            pts[i * 3] = Math.cos(phi) * r * radius;
            pts[i * 3 + 1] = y * radius;
            pts[i * 3 + 2] = Math.sin(phi) * r * radius;
        }
        return pts;
    }
}
