import * as ByteBuffer from "bytebuffer";
export declare function isPublicKey(publicKeyHex: string): boolean;
export declare function unformat(commaFormatted: string): string;
export declare function commaFormat(amount: string): string;
export declare function isNumber(value: string): boolean;
/**
 * Very forgiving test to determine if the number of fractional parts
 * exceeds @decimals param.
 *
 * @param value String number value, can contain commas
 * @param decimals Number max allowed number of decimals.
 * @return boolean
 */
export declare function hasToManyDecimals(value: string, decimals: number): boolean;
export declare function timestampToDate(timestamp: number): Date;
export declare function epochTime(): number;
export declare function roundTo(value: string, decimals: number): string;
export declare function formatQNT(quantity: string, decimals: number, returnNullZero?: boolean): string | null;
export declare function trimDecimals(formatted: string, decimals: number): string;
export declare function convertToQNTf(quantity: string): string;
export declare function calculateTotalOrderPriceQNT(quantityQNT: string, priceQNT: string): string;
/**
 * Converts a float to a QNT based on the number of decimals to use.
 * Note! That this method throws a ConvertToQNTError in case the
 * input is invalid. Callers must catch and handle this situation.
 *
 * @throws utils.ConvertToQNTError
 */
export declare function convertToQNT(quantity: string): string;
/**
 * Count bytes in a string's UTF-8 representation.
 * @param   string
 * @return  number
 */
export declare function getByteLen(value: string): number;
export declare function debounce(func: Function, wait?: number, immediate?: boolean): () => void;
export declare function repeatWhile(delay: number, cb: () => boolean): void;
export declare function emptyToNull(input: string): string | null;
export declare function isString(input: any): boolean;
export declare function isDefined(input: any): boolean;
export declare function isObject(input: any): boolean;
export declare function isArray(input: any): boolean;
export declare function extend(destination: {
    [key: string]: any;
}, source: {
    [key: string]: any;
}): {
    [key: string]: any;
};
export declare function isEmpty(obj: {
    [key: string]: any;
}): boolean;
export declare function readBytes(buffer: ByteBuffer, length: number, offset?: number): number[];
export declare function writeBytes(buffer: ByteBuffer, bytes: number[]): void;
export declare function setPromiseTimeout<T>(milliseconds: number, promise: Promise<any>): Promise<T>;
