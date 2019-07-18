import { Context } from "../resource/Context";
export declare class QuickTestTool {
    private static showedDic;
    private static _rendertypeToStrDic;
    private static _typeToNameDic;
    static getMCDName(type: number): string;
    static showRenderTypeInfo(type: any, force?: boolean): void;
    static __init__(): void;
    _renderType: number;
    _repaint: number;
    _x: number;
    _y: number;
    constructor();
    render(context: Context, x: number, y: number): void;
    private static _PreStageRender;
    private static _countDic;
    private static _countStart;
    private static _i;
    private static _countEnd;
    static showCountInfo(): void;
    static enableQuickTest(): void;
}
