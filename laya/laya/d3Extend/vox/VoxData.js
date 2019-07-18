import { VoxFileData } from "./VoxFileData";
export class VoxData {
    constructor(_voxels, xsize, ysize, zsize, ColorPlane) {
        this.voxels = [];
        this.sizex = xsize;
        this.sizey = zsize;
        this.sizez = ysize;
        for (var j = 0; j < _voxels.length; j += 4) {
            this.voxels.push((_voxels[j]) - Math.round(this.sizex / 2));
            this.voxels.push((_voxels[j + 2]));
            this.voxels.push(this.sizez - (_voxels[j + 1]) - Math.round(this.sizez / 2));
            if (ColorPlane == 0)
                this.voxels.push(VoxFileData.turecolor[_voxels[j + 3]]);
            else
                this.voxels.push(VoxFileData.TextureColor[_voxels[j + 3]]);
        }
        this.count = this.voxels.length / 4;
    }
}
