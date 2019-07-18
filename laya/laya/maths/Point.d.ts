export declare class Point {
    static TEMP: Point;
    static EMPTY: Point;
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static create(): Point;
    setTo(x: number, y: number): Point;
    reset(): Point;
    recover(): void;
    distance(x: number, y: number): number;
    toString(): string;
    normalize(): void;
    copy(point: Point): Point;
}
