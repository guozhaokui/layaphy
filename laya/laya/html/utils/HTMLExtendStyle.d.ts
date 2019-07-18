export declare class HTMLExtendStyle {
    static EMPTY: HTMLExtendStyle;
    stroke: number;
    strokeColor: string;
    leading: number;
    lineHeight: number;
    letterSpacing: number;
    href: string;
    constructor();
    reset(): HTMLExtendStyle;
    recover(): void;
    static create(): HTMLExtendStyle;
}
