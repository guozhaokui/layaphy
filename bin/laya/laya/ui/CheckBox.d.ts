import { Button } from "./Button";
export declare class CheckBox extends Button {
    constructor(skin?: string, label?: string);
    protected preinitialize(): void;
    protected initialize(): void;
    dataSource: any;
}
