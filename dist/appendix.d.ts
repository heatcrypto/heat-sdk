import * as ByteBuffer from "bytebuffer";
import Long from "long";
import * as crypto from "./crypto";
export interface Appendix {
    getSize(): number;
    putBytes(buffer: ByteBuffer): void;
    getJSONObject(): Object;
    getVersion(): number;
    getFee(): string;
}
export declare abstract class AbstractAppendix implements Appendix {
    constructor(buffer?: ByteBuffer);
    protected version: number;
    abstract getAppendixName(): string;
    getSize(): number;
    abstract getMySize(): number;
    putBytes(buffer: ByteBuffer): void;
    parse(buffer: ByteBuffer): this;
    abstract putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    getJSONObject(): {
        [key: string]: any;
    };
    abstract putMyJSON(json: Object): void;
    getVersion(): number;
    abstract getFee(): string;
}
export declare class AppendixMessage extends AbstractAppendix {
    private message;
    private isText;
    init(message: Array<number>, isText: boolean): this;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getMessage(): number[];
    getIsText(): boolean;
}
export declare abstract class AbstractAppendixEncryptedMessage extends AbstractAppendix {
    private encryptedMessage;
    private isText_;
    init(message: crypto.IEncryptedMessage, isText: boolean): this;
    getFee(): string;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    isText(): boolean;
}
export declare class AppendixEncryptedMessage extends AbstractAppendixEncryptedMessage {
    getAppendixName(): string;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
}
export declare class AppendixEncryptToSelfMessage extends AbstractAppendixEncryptedMessage {
    getAppendixName(): string;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
}
export declare class AppendixPublicKeyAnnouncement extends AbstractAppendix {
    private publicKey;
    init(publicKey: Array<number>): this;
    parse(buffer: ByteBuffer): this;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
}
export declare class AppendixPrivateNameAnnouncement extends AbstractAppendix {
    private privateNameAnnouncement;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getName(): Long;
}
export declare class AppendixPrivateNameAssignment extends AbstractAppendix {
    private privateNameAssignment;
    private signature;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getName(): Long;
}
export declare class AppendixPublicNameAnnouncement extends AbstractAppendix {
    private nameHash;
    private publicNameAnnouncement;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getFullName(): Int8Array;
    getNameHash(): Long;
}
export declare class AppendixPublicNameAssignment extends AbstractAppendix {
    private publicNameAssignment;
    private signature;
    private nameHash;
    getFee(): string;
    getAppendixName(): string;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getFullName(): number[];
    getNameHash(): Long;
}
