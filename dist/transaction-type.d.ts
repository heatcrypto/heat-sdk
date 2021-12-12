import * as attachment from "./attachment";
import * as ByteBuffer from "bytebuffer";
export declare abstract class TransactionType {
    static TYPE_PAYMENT: number;
    static TYPE_MESSAGING: number;
    static TYPE_COLORED_COINS: number;
    static TYPE_ACCOUNT_CONTROL: number;
    static SUBTYPE_PAYMENT_ORDINARY_PAYMENT: number;
    static SUBTYPE_MESSAGING_ARBITRARY_MESSAGE: number;
    static SUBTYPE_COLORED_COINS_ASSET_ISSUANCE: number;
    static SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE: number;
    static SUBTYPE_COLORED_COINS_ASSET_TRANSFER: number;
    static SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT: number;
    static SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT: number;
    static SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION: number;
    static SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION: number;
    static SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_ADDITION: number;
    static SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL: number;
    static SUBTYPE_COLORED_COINS_WHITELIST_MARKET: number;
    static SUBTYPE_COLORED_COINS_ATOMIC_MULTI_TRANSFER: number;
    static SUBTYPE_ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING: number;
    abstract getType(): number;
    abstract getSubtype(): number;
    abstract parseAttachment(buffer: ByteBuffer): attachment.Attachment;
    abstract parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.Attachment;
    abstract canHaveRecipient(): boolean;
    static findTransactionType(type: number, subtype: number): OrdinaryPayment | ArbitraryMessage | AssetIssuance | AssetIssueMore | AssetTransfer | AtomicMultiTransfer | AskOrderPlacement | BidOrderPlacement | AskOrderCancellation | BidOrderCancellation | WhitelistAccountAddition | WhitelistAccountRemoval | WhitelistMarket | EffectiveBalanceLeasing;
    mustHaveRecipient(): boolean;
}
export declare class OrdinaryPayment extends TransactionType {
    getType(): number;
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.Payment;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.Payment;
    canHaveRecipient(): boolean;
}
export declare class ArbitraryMessage extends TransactionType {
    getType(): number;
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.Message;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.Message;
    canHaveRecipient(): boolean;
    mustHaveRecipient(): boolean;
}
export declare abstract class ColoredCoins extends TransactionType {
    getType(): number;
}
export declare class AssetIssuance extends ColoredCoins {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.AssetIssuance;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.AssetIssuance;
    canHaveRecipient(): boolean;
}
export declare class AssetIssueMore extends ColoredCoins {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.AssetIssueMore;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.AssetIssueMore;
    canHaveRecipient(): boolean;
}
export declare class AssetTransfer extends ColoredCoins {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.AssetTransfer;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.AssetTransfer;
    canHaveRecipient(): boolean;
}
export declare class AtomicMultiTransfer extends ColoredCoins {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.AtomicMultiTransfer;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.AtomicMultiTransfer;
    canHaveRecipient(): boolean;
}
export declare abstract class ColoredCoinsOrderPlacement extends ColoredCoins {
    canHaveRecipient(): boolean;
}
export declare class AskOrderPlacement extends ColoredCoinsOrderPlacement {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsAskOrderPlacement;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsAskOrderPlacement;
}
export declare class BidOrderPlacement extends ColoredCoinsOrderPlacement {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsBidOrderPlacement;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsBidOrderPlacement;
}
export declare abstract class ColoredCoinsOrderCancellation extends ColoredCoins {
    canHaveRecipient(): boolean;
}
export declare class AskOrderCancellation extends ColoredCoinsOrderCancellation {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsAskOrderCancellation;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsAskOrderCancellation;
}
export declare class BidOrderCancellation extends ColoredCoinsOrderCancellation {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsBidOrderCancellation;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsBidOrderCancellation;
}
export declare abstract class ColoredCoinsWhitelist extends ColoredCoins {
    canHaveRecipient(): boolean;
}
export declare class WhitelistAccountAddition extends ColoredCoinsWhitelist {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsWhitelistAccountAddition;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsWhitelistAccountAddition;
}
export declare class WhitelistAccountRemoval extends ColoredCoinsWhitelist {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsWhitelistAccountRemoval;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsWhitelistAccountRemoval;
}
export declare class WhitelistMarket extends ColoredCoinsWhitelist {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.ColoredCoinsWhitelistMarket;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.ColoredCoinsWhitelistMarket;
}
export declare abstract class AccountControl extends TransactionType {
    getType(): number;
    canHaveRecipient(): boolean;
}
export declare class EffectiveBalanceLeasing extends AccountControl {
    getSubtype(): number;
    parseAttachment(buffer: ByteBuffer): attachment.AccountControlEffectiveBalanceLeasing;
    parseAttachmentJSON(json: {
        [key: string]: any;
    }): attachment.AccountControlEffectiveBalanceLeasing;
}
export declare const ORDINARY_PAYMENT_TRANSACTION_TYPE: OrdinaryPayment;
export declare const ARBITRARY_MESSAGE_TRANSACTION_TYPE: ArbitraryMessage;
export declare const COLORED_COINS_ASSET_ISSUANCE_TRANSACTION_TYPE: AssetIssuance;
export declare const COLORED_COINS_ASSET_ISSUE_MORE_TRANSACTION_TYPE: AssetIssueMore;
export declare const COLORED_COINS_ASSET_TRANSFER_TRANSACTION_TYPE: AssetTransfer;
export declare const COLORED_COINS_ATOMIC_MULTI_TRANSFER_TRANSACTION_TYPE: AtomicMultiTransfer;
export declare const COLORED_COINS_ASK_ORDER_PLACEMENT_TRANSACTION_TYPE: AskOrderPlacement;
export declare const COLORED_COINS_BID_ORDER_PLACEMENT_TRANSACTION_TYPE: BidOrderPlacement;
export declare const ASK_ORDER_CANCELLATION_TRANSACTION_TYPE: AskOrderCancellation;
export declare const BID_ORDER_CANCELLATION_TRANSACTION_TYPE: BidOrderCancellation;
export declare const WHITELIST_ACCOUNT_ADDITION_TRANSACTION_TYPE: WhitelistAccountAddition;
export declare const WHITELIST_ACCOUNT_REMOVAL_TRANSACTION_TYPE: WhitelistAccountRemoval;
export declare const WHITELIST_MARKET_TRANSACTION_TYPE: WhitelistMarket;
export declare const EFFECTIVE_BALANCE_LEASING_TRANSACTION_TYPE: EffectiveBalanceLeasing;
