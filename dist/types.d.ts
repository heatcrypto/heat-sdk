/// <reference types="node" />
/// <reference types="long" />
export interface RpcError {
    exceptionClass: string;
    message: string;
}
export declare const RpcErrorType: any;
export interface Transaction {
    type: number;
    subtype: number;
    version: number;
    timestamp: number;
    deadline: number;
    senderPublicKey: Buffer;
    recipientId: Long;
    amountHQT: Long;
    feeHQT: Long;
    signature: Buffer;
    flags: number;
    ecBlockHeight: number;
    ecBlockId: Long;
    attachmentBytes: Buffer;
    appendixBytes: Buffer;
}
export declare const TransactionType: any;
export interface BroadcastRequest {
    transaction: Transaction;
}
export declare const BroadcastRequestType: any;
export interface BroadcastResponse {
    transaction: Long;
}
export declare const BroadcastResponseType: any;
