export class HalfFloatUtils {
    static __init__() {
        for (var i = 0; i < 256; ++i) {
            var e = i - 127;
            if (e < -27) {
                HalfFloatUtils._baseTable[i | 0x000] = 0x0000;
                HalfFloatUtils._baseTable[i | 0x100] = 0x8000;
                HalfFloatUtils._shiftTable[i | 0x000] = 24;
                HalfFloatUtils._shiftTable[i | 0x100] = 24;
            }
            else if (e < -14) {
                HalfFloatUtils._baseTable[i | 0x000] = 0x0400 >> (-e - 14);
                HalfFloatUtils._baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
                HalfFloatUtils._shiftTable[i | 0x000] = -e - 1;
                HalfFloatUtils._shiftTable[i | 0x100] = -e - 1;
            }
            else if (e <= 15) {
                HalfFloatUtils._baseTable[i | 0x000] = (e + 15) << 10;
                HalfFloatUtils._baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
                HalfFloatUtils._shiftTable[i | 0x000] = 13;
                HalfFloatUtils._shiftTable[i | 0x100] = 13;
            }
            else if (e < 128) {
                HalfFloatUtils._baseTable[i | 0x000] = 0x7c00;
                HalfFloatUtils._baseTable[i | 0x100] = 0xfc00;
                HalfFloatUtils._shiftTable[i | 0x000] = 24;
                HalfFloatUtils._shiftTable[i | 0x100] = 24;
            }
            else {
                HalfFloatUtils._baseTable[i | 0x000] = 0x7c00;
                HalfFloatUtils._baseTable[i | 0x100] = 0xfc00;
                HalfFloatUtils._shiftTable[i | 0x000] = 13;
                HalfFloatUtils._shiftTable[i | 0x100] = 13;
            }
        }
        HalfFloatUtils._mantissaTable[0] = 0;
        for (i = 1; i < 1024; ++i) {
            var m = i << 13;
            e = 0;
            while ((m & 0x00800000) === 0) {
                e -= 0x00800000;
                m <<= 1;
            }
            m &= ~0x00800000;
            e += 0x38800000;
            HalfFloatUtils._mantissaTable[i] = m | e;
        }
        for (i = 1024; i < 2048; ++i) {
            HalfFloatUtils._mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
        }
        HalfFloatUtils._exponentTable[0] = 0;
        for (i = 1; i < 31; ++i) {
            HalfFloatUtils._exponentTable[i] = i << 23;
        }
        HalfFloatUtils._exponentTable[31] = 0x47800000;
        HalfFloatUtils._exponentTable[32] = 0x80000000;
        for (i = 33; i < 63; ++i) {
            HalfFloatUtils._exponentTable[i] = 0x80000000 + ((i - 32) << 23);
        }
        HalfFloatUtils._exponentTable[63] = 0xc7800000;
        HalfFloatUtils._offsetTable[0] = 0;
        for (i = 1; i < 64; ++i) {
            if (i === 32) {
                HalfFloatUtils._offsetTable[i] = 0;
            }
            else {
                HalfFloatUtils._offsetTable[i] = 1024;
            }
        }
    }
    static roundToFloat16Bits(num) {
        HalfFloatUtils._floatView[0] = num;
        var f = HalfFloatUtils._uint32View[0];
        var e = (f >> 23) & 0x1ff;
        return HalfFloatUtils._baseTable[e] + ((f & 0x007fffff) >> HalfFloatUtils._shiftTable[e]);
    }
    static convertToNumber(float16bits) {
        var m = float16bits >> 10;
        HalfFloatUtils._uint32View[0] = HalfFloatUtils._mantissaTable[HalfFloatUtils._offsetTable[m] + (float16bits & 0x3ff)] + HalfFloatUtils._exponentTable[m];
        return HalfFloatUtils._floatView[0];
    }
}
HalfFloatUtils._buffer = new ArrayBuffer(4);
HalfFloatUtils._floatView = new Float32Array(HalfFloatUtils._buffer);
HalfFloatUtils._uint32View = new Uint32Array(HalfFloatUtils._buffer);
HalfFloatUtils._baseTable = new Uint32Array(512);
HalfFloatUtils._shiftTable = new Uint32Array(512);
HalfFloatUtils._mantissaTable = new Uint32Array(2048);
HalfFloatUtils._exponentTable = new Uint32Array(64);
HalfFloatUtils._offsetTable = new Uint32Array(64);
