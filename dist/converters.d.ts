/// <reference types="big.js" />
export declare function byteArrayToHexString(bytes: Array<number>): string;
export declare function stringToByteArray(stringValue: string): Array<number>;
export declare function hexStringToByteArray(str: string): Array<number>;
export declare function stringToHexString(str: string): string;
export declare function hexStringToString(hex: string): string;
export declare function byteArrayToSignedShort(bytes: Array<number>, opt_startIndex?: number): any;
export declare function byteArrayToSignedInt32(bytes: Array<number>, opt_startIndex?: number): number;
export declare function byteArrayToBigInteger(bytes: Array<number>, opt_startIndex?: number): BigJsLibrary.BigJS;
export interface IWordArray {
    sigBytes: number;
    words: Uint32Array;
}
export declare function byteArrayToWordArray(byteArray: Array<number>): IWordArray;
export declare function wordArrayToByteArray(wordArray: IWordArray): Array<number>;
export declare function byteArrayToString(bytes: Array<number>, opt_startIndex?: any, length?: any): string;
export declare function byteArrayToShortArray(byteArray: Array<number>): Array<number>;
export declare function shortArrayToByteArray(shortArray: Array<number>): Array<number>;
export declare function shortArrayToHexString(ary: Array<number>): string;
export declare function int32ToBytes(x: number, opt_bigEndian: boolean): number[];
