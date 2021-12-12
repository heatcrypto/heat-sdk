import * as appendix from "./appendix";
import * as transactionType from "./transaction-type";
import Long from "long";
import * as ByteBuffer from "bytebuffer";
export interface Attachment extends appendix.Appendix {
    getTransactionType(): transactionType.TransactionType;
}
export declare abstract class EmptyAttachment extends appendix.AbstractAppendix implements Attachment {
    constructor();
    parse(buffer: ByteBuffer): this;
    getSize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getMySize(): number;
    abstract getTransactionType(): transactionType.TransactionType;
    abstract getFee(): string;
}
export declare class Payment extends EmptyAttachment {
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.OrdinaryPayment;
}
export declare class Message extends EmptyAttachment {
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.ArbitraryMessage;
}
export declare class AssetIssuance extends appendix.AbstractAppendix implements Attachment {
    private descriptionUrl;
    private descriptionHash;
    private quantity;
    private decimals;
    private dillutable;
    init(descriptionUrl: string, descriptionHash: number[], quantity: string, decimals: number, dillutable: boolean): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.AssetIssuance;
    getDescriptionUrl(): string;
    getDescriptionHash(): number[];
    getQuantity(): Long;
    getDecimals(): number;
    getDillutable(): boolean;
}
export declare abstract class AssetBase extends appendix.AbstractAppendix {
    private assetId;
    private quantity;
    init(assetId: string, quantity: string): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    getAssetId(): Long;
    getQuantity(): Long;
}
export declare class AssetIssueMore extends AssetBase implements Attachment {
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.AssetIssueMore;
}
export declare class AssetTransfer extends AssetBase implements Attachment {
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.AssetTransfer;
}
export declare type AtomicTransfer = {
    recipient: string;
    assetId: string;
    quantity: string;
};
export declare class AtomicMultiTransfer extends appendix.AbstractAppendix implements Attachment {
    private transfers;
    init(transfers: AtomicTransfer[]): this;
    readonly getTransfers: AtomicTransfer[];
    getFee(): string;
    getAppendixName(): string;
    getTransactionType(): transactionType.AtomicMultiTransfer;
    getMySize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    parse(buffer: ByteBuffer): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
}
export declare abstract class ColoredCoinsOrderPlacement extends appendix.AbstractAppendix {
    private currencyId;
    private assetId;
    private quantity;
    private price;
    private expiration;
    init(currencyId: string, assetId: string, quantity: string, price: string, expiration: number): this;
    getMySize(): number;
    putMyBytes(buffer: ByteBuffer): void;
    parse(buffer: ByteBuffer): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    getFee(): string;
    getCurrencyId(): Long;
    getAssetId(): Long;
    getQuantity(): Long;
    getPrice(): Long;
    getExpiration(): number;
}
export declare class ColoredCoinsAskOrderPlacement extends ColoredCoinsOrderPlacement implements Attachment {
    getAppendixName(): string;
    getTransactionType(): transactionType.AskOrderPlacement;
}
export declare class ColoredCoinsBidOrderPlacement extends ColoredCoinsOrderPlacement implements Attachment {
    getAppendixName(): string;
    getTransactionType(): transactionType.BidOrderPlacement;
}
export declare abstract class ColoredCoinsOrderCancellation extends appendix.AbstractAppendix {
    private orderId;
    init(orderId: string): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getFee(): string;
    getOrderId(): Long;
}
export declare class ColoredCoinsAskOrderCancellation extends ColoredCoinsOrderCancellation implements Attachment {
    getAppendixName(): string;
    getTransactionType(): transactionType.AskOrderCancellation;
}
export declare class ColoredCoinsBidOrderCancellation extends ColoredCoinsOrderCancellation implements Attachment {
    getAppendixName(): string;
    getTransactionType(): transactionType.BidOrderCancellation;
}
export declare class ColoredCoinsWhitelistAccountAddition extends appendix.AbstractAppendix implements Attachment {
    private assetId;
    private accountId;
    private endHeight;
    init(assetId: string, accountId: string, endHeight: number): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getAppendixName(): string;
    getTransactionType(): transactionType.WhitelistAccountAddition;
    getFee(): string;
    getAssetId(): Long;
    getAccountId(): Long;
    getEndHeight(): number;
}
export declare class ColoredCoinsWhitelistAccountRemoval extends appendix.AbstractAppendix implements Attachment {
    private assetId;
    private accountId;
    init(assetId: string, accountId: string): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getAppendixName(): string;
    getTransactionType(): transactionType.WhitelistAccountRemoval;
    getFee(): string;
    getAssetId(): Long;
    getAccountId(): Long;
}
export declare class ColoredCoinsWhitelistMarket extends appendix.AbstractAppendix implements Attachment {
    private currencyId;
    private assetId;
    init(currencyId: string, assetId: string): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getAppendixName(): string;
    getTransactionType(): transactionType.WhitelistMarket;
    getFee(): string;
    getAssetId(): Long;
    getCurrencyId(): Long;
}
export declare class AccountControlEffectiveBalanceLeasing extends appendix.AbstractAppendix implements Attachment {
    private period;
    init(period: number): this;
    getMySize(): number;
    parse(buffer: ByteBuffer): this;
    putMyBytes(buffer: ByteBuffer): void;
    parseJSON(json: {
        [key: string]: any;
    }): this;
    putMyJSON(json: {
        [key: string]: any;
    }): void;
    getAppendixName(): string;
    getTransactionType(): transactionType.EffectiveBalanceLeasing;
    getFee(): string;
    getPeriod(): number;
}
export declare const ORDINARY_PAYMENT: Payment;
export declare const ARBITRARY_MESSAGE: Message;
