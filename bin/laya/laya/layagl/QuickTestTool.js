import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
import { Stage } from "../display/Stage";
import { RenderSprite } from "../renders/RenderSprite";
export class QuickTestTool {
    constructor() {
    }
    static getMCDName(type) {
        return QuickTestTool._typeToNameDic[type];
    }
    static showRenderTypeInfo(type, force = false) {
        if (!force && QuickTestTool.showedDic[type])
            return;
        QuickTestTool.showedDic[type] = true;
        if (!QuickTestTool._rendertypeToStrDic[type]) {
            var arr = [];
            var tType;
            tType = 1;
            while (tType <= type) {
                if (tType & type) {
                    arr.push(QuickTestTool.getMCDName(tType & type));
                }
                tType = tType << 1;
            }
            QuickTestTool._rendertypeToStrDic[type] = arr.join(",");
        }
        console.log("cmd:", QuickTestTool._rendertypeToStrDic[type]);
    }
    static __init__() {
        QuickTestTool._typeToNameDic[SpriteConst.ALPHA] = "ALPHA";
        QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM] = "TRANSFORM";
        QuickTestTool._typeToNameDic[SpriteConst.TEXTURE] = "TEXTURE";
        QuickTestTool._typeToNameDic[SpriteConst.GRAPHICS] = "GRAPHICS";
        QuickTestTool._typeToNameDic[SpriteConst.ONECHILD] = "ONECHILD";
        QuickTestTool._typeToNameDic[SpriteConst.CHILDS] = "CHILDS";
        QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM | SpriteConst.ALPHA] = "TRANSFORM|ALPHA";
        QuickTestTool._typeToNameDic[SpriteConst.CANVAS] = "CANVAS";
        QuickTestTool._typeToNameDic[SpriteConst.BLEND] = "BLEND";
        QuickTestTool._typeToNameDic[SpriteConst.FILTERS] = "FILTERS";
        QuickTestTool._typeToNameDic[SpriteConst.MASK] = "MASK";
        QuickTestTool._typeToNameDic[SpriteConst.CLIP] = "CLIP";
        QuickTestTool._typeToNameDic[SpriteConst.LAYAGL3D] = "LAYAGL3D";
    }
    render(context, x, y) {
        QuickTestTool._addType(this._renderType);
        QuickTestTool.showRenderTypeInfo(this._renderType);
        RenderSprite.renders[this._renderType]._fun(this, context, x + this._x, y + this._y);
        this._repaint = 0;
    }
    _stageRender(context, x, y) {
        QuickTestTool._countStart();
        QuickTestTool._PreStageRender.call(window.Laya.stage, context, x, y);
        QuickTestTool._countEnd();
    }
    static _countStart() {
        var key;
        for (key in QuickTestTool._countDic) {
            QuickTestTool._countDic[key] = 0;
        }
    }
    static _countEnd() {
        QuickTestTool._i++;
        if (QuickTestTool._i > 60) {
            QuickTestTool.showCountInfo();
            QuickTestTool._i = 0;
        }
    }
    static _addType(type) {
        if (!QuickTestTool._countDic[type]) {
            QuickTestTool._countDic[type] = 1;
        }
        else {
            QuickTestTool._countDic[type] += 1;
        }
    }
    static showCountInfo() {
        console.log("===================");
        var key;
        for (key in QuickTestTool._countDic) {
            console.log("count:" + QuickTestTool._countDic[key]);
            QuickTestTool.showRenderTypeInfo(key, true);
        }
    }
    static enableQuickTest() {
        QuickTestTool.__init__();
        Sprite["prototype"]["render"] = QuickTestTool["prototype"]["render"];
        QuickTestTool._PreStageRender = Stage["prototype"]["render"];
        Stage["prototype"]["render"] = QuickTestTool["prototype"]["_stageRender"];
    }
}
QuickTestTool.showedDic = {};
QuickTestTool._rendertypeToStrDic = {};
QuickTestTool._typeToNameDic = {};
QuickTestTool._countDic = {};
QuickTestTool._i = 0;
