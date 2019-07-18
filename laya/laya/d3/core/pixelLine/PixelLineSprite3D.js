import { PixelLineFilter } from "./PixelLineFilter";
import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineMaterial } from "./PixelLineMaterial";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { RenderElement } from "../render/RenderElement";
export class PixelLineSprite3D extends RenderableSprite3D {
    get maxLineCount() {
        return this._geometryFilter._maxLineCount;
    }
    set maxLineCount(value) {
        this._geometryFilter._resizeLineData(value);
        this._geometryFilter._lineCount = Math.min(this._geometryFilter._lineCount, value);
    }
    get lineCount() {
        return this._geometryFilter._lineCount;
    }
    set lineCount(value) {
        if (value > this.maxLineCount)
            throw "PixelLineSprite3D: lineCount can't large than maxLineCount";
        else
            this._geometryFilter._lineCount = value;
    }
    get pixelLineRenderer() {
        return this._render;
    }
    constructor(maxCount = 2, name = null) {
        super(name);
        this._geometryFilter = new PixelLineFilter(this, maxCount);
        this._render = new PixelLineRenderer(this);
        this._changeRenderObjects(this._render, 0, PixelLineMaterial.defaultMaterial);
    }
    _changeRenderObjects(sender, index, material) {
        var renderObjects = this._render._renderElements;
        (material) || (material = PixelLineMaterial.defaultMaterial);
        var renderElement = renderObjects[index];
        (renderElement) || (renderElement = renderObjects[index] = new RenderElement());
        renderElement.setTransform(this._transform);
        renderElement.setGeometry(this._geometryFilter);
        renderElement.render = this._render;
        renderElement.material = material;
    }
    addLine(startPosition, endPosition, startColor, endColor) {
        if (this._geometryFilter._lineCount !== this._geometryFilter._maxLineCount)
            this._geometryFilter._updateLineData(this._geometryFilter._lineCount++, startPosition, endPosition, startColor, endColor);
        else
            throw "PixelLineSprite3D: lineCount has equal with maxLineCount.";
    }
    addLines(lines) {
        var lineCount = this._geometryFilter._lineCount;
        var addCount = lines.length;
        if (lineCount + addCount > this._geometryFilter._maxLineCount) {
            throw "PixelLineSprite3D: lineCount plus lines count must less than maxLineCount.";
        }
        else {
            this._geometryFilter._updateLineDatas(lineCount, lines);
            this._geometryFilter._lineCount += addCount;
        }
    }
    removeLine(index) {
        if (index < this._geometryFilter._lineCount)
            this._geometryFilter._removeLineData(index);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
    }
    setLine(index, startPosition, endPosition, startColor, endColor) {
        if (index < this._geometryFilter._lineCount)
            this._geometryFilter._updateLineData(index, startPosition, endPosition, startColor, endColor);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
    }
    getLine(index, out) {
        if (index < this.lineCount)
            this._geometryFilter._getLineData(index, out);
        else
            throw "PixelLineSprite3D: index must less than lineCount.";
    }
    clear() {
        this._geometryFilter._lineCount = 0;
    }
    _create() {
        return new PixelLineSprite3D();
    }
}
