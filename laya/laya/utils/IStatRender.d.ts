export declare class IStatRender {
    show(x?: number, y?: number): void;
    enable(): void;
    hide(): void;
    set_onclick(fn: Function): void;
    isCanvasRender(): boolean;
    renderNotCanvas(ctx: any, x: number, y: number): void;
}
