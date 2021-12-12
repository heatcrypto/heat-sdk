import * as converters from "./converters";
import * as crypto from "./crypto";
import * as utils from "./utils";
import * as _attachment from "./attachment";
import * as builder from "./builder";
import * as transaction from "./transaction";
import { HeatApi } from "./heat-api";
import { HeatSubscriber } from "./heat-subscriber";
import { SecretGenerator } from "./secret-generator";
import { setRandomSource } from "./random-bytes";
import { HeatRpc } from "./heat-rpc";
import * as types from "./types";
import { AtomicTransfer } from "./attachment";
export declare const attachment: typeof _attachment;
export declare const Builder: typeof builder.Builder;
export declare const TransactionImpl: typeof builder.TransactionImpl;
export declare const Transaction: typeof transaction.Transaction;
export declare const Type: {
    forSchema(schema: any): any;
};
export interface ConfigArgs {
    isTestnet?: boolean;
    baseURL?: string;
    websocketURL?: string;
    genesisKey?: Array<number>;
}
export declare class Configuration {
    isTestnet: boolean;
    baseURL: string;
    websocketURL: string;
    genesisKey: Array<number>;
    constructor(args?: ConfigArgs);
}
export declare class HeatSDK {
    api: HeatApi;
    subscriber: HeatSubscriber;
    rpc: HeatRpc;
    types: typeof types;
    utils: typeof utils;
    crypto: typeof crypto;
    converters: typeof converters;
    config: Configuration;
    secretGenerator: SecretGenerator;
    setRandomSource: typeof setRandomSource;
    constructor(config?: Configuration);
    parseTransactionBytes(transactionBytesHex: string): builder.TransactionImpl;
    parseTransactionJSON(json: {
        [key: string]: any;
    }): builder.TransactionImpl;
    passphraseEncrypt(plainText: string, passphrase: string): string;
    passphraseDecrypt(cipherText: string, passphrase: string): string;
    payment(recipientOrRecipientPublicKey: string, amount: string): transaction.Transaction;
    arbitraryMessage(recipientOrRecipientPublicKey: string, message: string): transaction.Transaction;
    privateMessage(recipientPublicKey: string, message: string): transaction.Transaction;
    privateMessageToSelf(message: string): transaction.Transaction;
    assetIssuance(descriptionUrl: string, descriptionHash: number[], quantity: string, decimals: number, dillutable: boolean, feeHQT?: string): transaction.Transaction;
    assetTransfer(recipientOrRecipientPublicKey: string, assetId: string, quantity: string, feeHQT?: string): transaction.Transaction;
    atomicMultiTransfer(recipientOrRecipientPublicKey: string, transfers: AtomicTransfer[], feeHQT?: string): transaction.Transaction;
    placeAskOrder(currencyId: string, assetId: string, quantity: string, price: string, expiration: number): transaction.Transaction;
    placeBidOrder(currencyId: string, assetId: string, quantity: string, price: string, expiration: number): transaction.Transaction;
    cancelAskOrder(orderId: string): transaction.Transaction;
    cancelBidOrder(orderId: string): transaction.Transaction;
}
