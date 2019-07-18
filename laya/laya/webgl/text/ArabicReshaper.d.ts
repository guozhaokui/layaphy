export declare class ArabicReshaper {
    private static charsMap;
    private static combCharsMap;
    private static transChars;
    characterMapContains(c: number): boolean;
    getCharRep(c: number): boolean;
    getCombCharRep(c1: any, c2: any): boolean;
    isTransparent(c: any): boolean;
    getOriginalCharsFromCode(code: any): string;
    convertArabic(normal: any): string;
    convertArabicBack(apfb: any): string;
}
