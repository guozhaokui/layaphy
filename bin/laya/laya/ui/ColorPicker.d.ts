import { UIComponent } from "./UIComponent";
import { Box } from "./Box";
import { Button } from "./Button";
import { Input } from "../display/Input";
import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
export declare class ColorPicker extends UIComponent {
    changeHandler: Handler;
    protected _gridSize: number;
    protected _bgColor: string;
    protected _borderColor: string;
    protected _inputColor: string;
    protected _inputBgColor: string;
    protected _colorPanel: Box;
    protected _colorTiles: Sprite;
    protected _colorBlock: Sprite;
    protected _colorInput: Input;
    protected _colorButton: Button;
    protected _colors: any[];
    protected _selectedColor: string;
    protected _panelChanged: boolean;
    destroy(destroyChild?: boolean): void;
    protected createChildren(): void;
    protected initialize(): void;
    private onPanelMouseDown;
    protected changePanel(): void;
    private onColorButtonClick;
    open(): void;
    close(): void;
    private removeColorBox;
    private onColorFieldKeyDown;
    private onColorInputChange;
    private onColorTilesClick;
    private onColorTilesMouseMove;
    protected getColorByMouse(): string;
    private drawBlock;
    selectedColor: string;
    skin: string;
    private changeColor;
    bgColor: string;
    borderColor: string;
    inputColor: string;
    inputBgColor: string;
    protected _setPanelChanged(): void;
}
