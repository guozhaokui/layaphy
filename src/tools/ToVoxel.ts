import { OBJLoader_Material, OBJLoader_mesh } from "./ObjectFile";

import * as fs from 'fs';
import * as path from 'path';
import * as dlg from "electron";
import { Texture2D } from "laya/resource/Texture2D";
import { Laya } from "Laya";
import { Lh2Voxel } from "./Lh2Voxel";
import { Handler } from "laya/utils/Handler";
import { BaseTexture } from "laya/resource/BaseTexture";

let selFile = '';
if (dlg) {
    dlg.remote.dialog.showOpenDialog({
        filters: [
            { name: 'all model file', extensions: ['obj', 'lvox', 'lh', 'vox'] },
            { name: 'All Files', extensions: ['*'] }], properties: ["openFile", 'createDirectory']
    }, function (p:any) {
        if (!p) return;
        var f = p[0].replace(/\\/g, '/');
        selFile = f;
        switch (path.extname(f).toLowerCase()) {
            case '.obj': onOpenOBJ(f); break;
            //case '.lvox2':onOpenLVox2(f); break;
            default: alert('不支持'); break;
        }
    });
}


/**
 * 转换obj文件。如果没有材质，就直接白色
 * @param	f obj文件
 */
function convertObjFile(f: string, objmtl: OBJLoader_Material): void {
    // 加载obj文件
    var objstr = fs.readFileSync(f, 'utf8');
    var objmesh: OBJLoader_mesh = new OBJLoader_mesh(objstr, null);
    // 所有的顶点，index，texture
    var vertnum = objmesh.vertices.length / 3;
    var uvnum = objmesh.textures.length / 2;
    if (objmtl && vertnum != uvnum) console.error('pos vertext num!=uv vertex num');
    //var mtls: Texture[] = [];
    var vertex = [];
    for (var vi = 0; vi < vertnum; vi++) {
        var tex: Texture2D|null = null;
        var mtlid = objmesh.vertexMaterialIndices[vi];
        var mtlname = objmesh.materialNames[mtlid];
        var mtl:any = objmtl && objmtl.materials[mtlname];
        if (mtl && mtl.mapDiffuse && mtl.mapDiffuse.filename) {
            tex = Laya.loader.getRes('file:///' + mtl.mapDiffuse.filename);
        }
        vertex.push([
            objmesh.vertices[vi * 3], objmesh.vertices[vi * 3 + 1], objmesh.vertices[vi * 3 + 2],
            objmesh.textures[vi * 2], 1 - objmesh.textures[vi * 2 + 1],
            tex]
        );
    }

    toVoxel(vertex, objmesh.indices, f);
}

function toVoxel(verteices:any[], indices:number[], origFile:string):void {
    var lv = new Lh2Voxel();
    lv.setModelData(verteices, indices);
    var i:int = 0;
    var sz = parseInt(input_sz.text);
    //sz = sz < 10?100:sz;
    //var ret:Array = lv.renderToVoxel(sz, sz, sz, 0.1);
    var retObj = lv.renderToPalVoxel(sz, parseInt(input_color.text));
    var ret = retObj.palcolor;
    //DEBUG
    //output
    var node =!!(window as any).require;
    if(node){
        fs.writeFileSync(__dirname+'/'+path.basename(origFile)+'.json',JSON.stringify(ret,null,'\t'));
    }
    //DEBUG
    
    // 显示
    //cubeMeshSprite3D.RemoveAllCube();
    //var cubeinfoArray:Vector.<CubeInfo> = new Vector.<CubeInfo>();
    for (i = 0; i < ret.length; i++) {
        var o:Object = ret[i];
        //cubeMeshSprite3D.AddCube(o.x, o.y, o.z, Lh2Voxel.colorToU32(o.color),0);
    }
    //cubeMeshSprite3D.UpColorData();
    
    // 保存
    /*
    var dt:Byte=lVoxFile.savelvoxfile(cubeMeshSprite3D);
    if (fs) {
        fs.writeFileSync(this.__dirname+'/'+this.path.basename(origFile)+'.lvox',new Uint8Array(dt.buffer));
    }
    */
    
    /*
    // 保存新的格式
    var compress2:VoxelFmt2 =  new VoxelFmt2();
    // 先转成完整数组
    var sz2 = sz * sz;
    var arraydt:Uint8Array = new Uint8Array(sz * sz2);
    for (i = 0; i < ret.length; i++) {
        var o:Object = ret[i];
        arraydt[o.x+o.z*sz+o.y*sz2] = retObj.idx[i];
    }
    var compret:ArrayBuffer = compress2.encode(null, new Uint8Array(retObj.pal), arraydt, sz, sz, sz);
    fs.writeFileSync(this.__dirname+'/'+this.path.basename(origFile)+'.lvox',new Uint8Array(compret));
    */
}


function onOpenOBJ(f: string): void {
    // 加载mtl文件
    var mtlf = f.substring(0, f.length - 4) + '.mtl';
    if (!fs.existsSync(mtlf)) {
        //alert('没有材质文件，就是没有贴图，还是算了吧');
        convertObjFile(f, null);
        return;
    }

    var objmtl: OBJLoader_Material = new OBJLoader_Material('root');
    objmtl.parse(fs.readFileSync(mtlf, 'utf8'));
    // 加载所有的贴图
    var allimg = [];
    // 统计所有的贴图
    for (var mn in objmtl.materials) {
        var cm: OBJLoader_Material = objmtl.materials[mn];
        if (cm.mapDiffuse && cm.mapDiffuse.filename) {
            allimg.push({ url: 'file:///' + cm.mapDiffuse.filename });
        }
    }

    // 这些贴图一起加载
    if (allimg.length == 0) {
        convertObjFile(f, null)
    }
    else Laya.loader.create(allimg, Handler.create(this, function () {
        convertObjFile(f, objmtl)
    }), null, null, [0, 0, BaseTexture.FORMAT_R8G8B8A8, true, true])
}
