import { Templet } from "./Templet";
import { SlotData } from "./SlotData";
import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
import { GraphicsAni } from "../GraphicsAni";
import { Matrix } from "../../maths/Matrix";
import { Graphics } from "../../display/Graphics";
import { Texture } from "../../resource/Texture";
export declare class BoneSlot {
    name: string;
    parent: string;
    attachmentName: string;
    srcDisplayIndex: number;
    type: string;
    templet: Templet;
    currSlotData: SlotData;
    currTexture: Texture;
    currDisplayData: SkinSlotDisplayData;
    displayIndex: number;
    originalIndex: number;
    private _diyTexture;
    private _parentMatrix;
    private _resultMatrix;
    private _replaceDic;
    private _curDiyUV;
    private _skinSprite;
    deformData: any[];
    showSlotData(slotData: SlotData, freshIndex?: boolean): void;
    showDisplayByName(name: string): void;
    replaceDisplayByName(tarName: string, newName: string): void;
    replaceDisplayByIndex(tarIndex: number, newIndex: number): void;
    showDisplayByIndex(index: number): void;
    replaceSkin(_texture: Texture): void;
    setParentMatrix(parentMatrix: Matrix): void;
    private _mVerticleArr;
    private static _tempMatrix;
    static createSkinMesh(): any;
    private static isSameArr;
    private static _tempResultMatrix;
    private _preGraphicVerticle;
    private getSaveVerticle;
    static isSameMatrix(mtA: Matrix, mtB: Matrix): boolean;
    private _preGraphicMatrix;
    private static useSameMatrixAndVerticle;
    private getSaveMatrix;
    draw(graphics: GraphicsAni, boneMatrixArray: any[], noUseSave?: boolean, alpha?: number): void;
    private static _tempVerticleArr;
    private skinMesh;
    drawBonePoint(graphics: Graphics): void;
    private getDisplayMatrix;
    getMatrix(): Matrix;
    copy(): BoneSlot;
}
