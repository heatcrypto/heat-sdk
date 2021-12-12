/// <reference types="big.js" />
import Long from "long";
export declare var SHA256: {
    init: typeof SHA256_init;
    update: typeof SHA256_write;
    getBytes: typeof SHA256_finalize;
};
export declare function getPublicKeyFromPrivateKey(privateKeyHex: string): string;
export declare function random8Values(len: number): Promise<Uint8Array>;
export declare function random16Values(len: number): Promise<Uint16Array>;
export declare function random32Values(len: number): Promise<Uint32Array>;
/**
 * Calculates a SHA256 hash from a string.
 *
 * @param inputString String (regular UTF-8 string)
 * @returns Hash as HEX String
 */
export declare function calculateStringHash(inputString: string): string;
export declare function calculateHashBytes(bytes: ArrayBuffer[]): any[];
/**
 * @param byteArray ByteArray
 * @param startIndex Int
 * @returns Big
 */
export declare function byteArrayToBigInteger(byteArray: any, startIndex?: number): BigJsLibrary.BigJS;
/**
 * @param unsignedTransaction hex-string
 * @param signature hex-string
 * @returns hex-string
 */
export declare function calculateFullHash(unsignedTransaction: string, signature: string): string;
/**
 * @param fullnameUTF8 UTF-8 user name
 * @returns hex-string
 */
export declare function fullNameToHash(fullNameUTF8: string): string;
export declare function fullNameToLong(fullName: number[]): Long;
/**
 * @param fullHashHex hex-string
 * @returns string
 */
export declare function calculateTransactionId(fullHashHex: string): string;
/**
 * Turns a secretphrase into a public key
 * @param secretPhrase String
 * @returns HEX string
 */
export declare function secretPhraseToPublicKey(secretPhrase: string): string;
/**
 * ..
 * @param secretPhrase Ascii String
 * @returns hex-string
 */
export declare function getPrivateKey(secretPhrase: string): string;
/**
 * @param secretPhrase Ascii String
 * @returns String
 */
export declare function getAccountId(secretPhrase: string): any;
/**
 * @param secretPhrase Hex String
 * @returns String
 */
export declare function getAccountIdFromPublicKey(publicKey: string): string;
/**
 * TODO pass secretphrase as string instead of HEX string, convert to
 * hex string ourselves.
 *
 * @param message HEX String
 * @param secretPhrase Hex String
 * @returns Hex String
 */
export declare function signBytes(message: string, secretPhrase: string): string;
/**
 * ...
 * @param signature     Hex String
 * @param message       Hex String
 * @param publicKey     Hex String
 * @returns Boolean
 */
export declare function verifyBytes(signature: string, message: string, publicKey: string): boolean;
export interface IEncryptOptions {
    account?: string;
    publicKey?: Array<number>;
    privateKey?: Array<number>;
    sharedKey?: Array<number>;
    nonce?: any;
}
/**
 * @param message String
 * @param options Object {
 *    account: String,    // recipient account id
 *    publicKey: String,  // recipient public key
 * }
 * @param secretPhrase String
 * @returns { message: String, nonce: String }
 */
export declare function encryptNote(message: string, options: IEncryptOptions, secretPhrase: string, uncompressed?: boolean): Promise<{
    message: string;
    nonce: string;
}>;
/**
 * @param message Byte Array
 * @param options Object {
 *    account: String,    // recipient account id
 *    publicKey: String,  // recipient public key
 * }
 * @param secretPhrase String
 * @returns { message: String, nonce: String }
 */
export declare function encryptBinaryNote(message: Array<number>, options: IEncryptOptions, secretPhrase: string, uncompressed?: boolean): Promise<{
    nonce: string;
    message: string;
}>;
export interface IEncryptedMessage {
    isText: boolean;
    data: string;
    nonce: string;
}
export declare function encryptMessage(message: string, publicKey: string, secretPhrase: string, uncompressed?: boolean): Promise<IEncryptedMessage>;
export declare function decryptMessage(data: string, nonce: string, publicKey: string, secretPhrase: string, uncompressed?: boolean): string;
export declare class PassphraseEncryptedMessage {
    ciphertext: string;
    salt: string;
    iv: string;
    HMAC: string;
    constructor(ciphertext: string, salt: string, iv: string, HMAC: string);
    static decode(encoded: string): PassphraseEncryptedMessage;
    encode(): string;
}
export declare function passphraseEncrypt(message: string, passphrase: string): PassphraseEncryptedMessage;
export declare function passphraseDecrypt(cp: PassphraseEncryptedMessage, passphrase: string): string | null;
declare function SHA256_init(): void;
declare function SHA256_write(msg: any): void;
declare function SHA256_finalize(): any[];
export {};
