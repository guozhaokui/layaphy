import { Color } from "../math/Color";
export declare class TextMesh {
    private static _indexBuffer;
    private _vertices;
    private _vertexBuffer;
    private _text;
    private _fontSize;
    private _color;
    text: string;
    fontSize: number;
    color: Color;
    constructor();
    private _createVertexBuffer;
    private _resizeVertexBuffer;
    private _addChar;
}
