import { Event } from "./Event";
export declare class KeyBoardManager {
    private static _pressKeys;
    static enabled: boolean;
    static _event: Event;
    static __init__(): void;
    private static _addEvent;
    private static _dispatch;
    static hasKeyDown(key: number): boolean;
}
