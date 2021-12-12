import { Builder, TransactionImpl } from "./builder";
import { HeatSDK } from "./heat-sdk";
export interface IBroadcastOutput {
    /**
     * The full hash of the signed transaction ,
     */
    fullHash: string;
    /**
     * The transaction ID
     */
    transaction: string;
}
export declare class Transaction {
    private heatsdk;
    private recipientOrRecipientPublicKey;
    private builder;
    private publicMessage_;
    private privateMessage_;
    private privateMessageToSelf_;
    private messageIsBinary_;
    private deadline_;
    private transaction_;
    constructor(heatsdk: HeatSDK, recipientOrRecipientPublicKey: string, builder: Builder);
    sign(secretPhrase: string): Promise<Transaction>;
    broadcast<T>(): Promise<T>;
    /**
     * Return signed transaction
     */
    getTransaction(): TransactionImpl;
    private build;
    private hasMessage;
    publicMessage(message: string, isBinary?: boolean): this;
    privateMessage(message: string, isBinary?: boolean): this;
    privateMessageToSelf(message: string, isBinary?: boolean): this;
    deadline(deadline: number): this;
}
