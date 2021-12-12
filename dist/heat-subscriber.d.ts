import { SubscriberBase } from "./subscriber-base";
import Subscription from "./subscription";
export declare class HeatSubscriber extends SubscriberBase {
    private BLOCK_PUSHED;
    private BLOCK_POPPED;
    private BALANCE_CHANGED;
    private ORDER;
    private TRADE;
    private MESSAGE;
    private UNCONFIRMED_TRANSACTION;
    private MICROSERVICE;
    constructor(url: string);
    blockPushed(filter: SubscriberBlockPushedFilter): Subscription<any>;
    blockPopped(filter: SubscriberBlockPoppedFilter): Subscription<any>;
    balanceChanged(filter: SubscriberBalanceChangedFilter): Subscription<any>;
    order(filter: SubscriberOrderFilter): Subscription<any>;
    trade(filter: SubscriberTradeFilter): Subscription<any>;
    message(filter: SubscriberMessageFilter): Subscription<any>;
    unconfirmedTransaction(filter: SubscriberUnconfirmedTransactionFilter): Subscription<any>;
    microservice(filter: {
        [key: string]: string;
    }): Subscription<any>;
}
export interface SubscriberBlockPushedFilter {
    generator?: string;
}
export interface SubscriberBlockPoppedFilter {
    generator?: string;
}
export interface SubscriberBalanceChangedFilter {
    account?: string;
    currency?: string;
}
export interface SubscriberBalanceChangedResponse {
    account: string;
    currency: string;
    quantity: string;
}
export interface SubscriberOrderFilter {
    account?: string;
    currency?: string;
    asset?: string;
    unconfirmed?: string;
    type?: string;
}
export interface SubscriberTradeFilter {
    seller?: string;
    buyer?: string;
    currency?: string;
    asset?: string;
}
export interface SubscriberMessageFilter {
    sender?: string;
    recipient?: string;
}
export interface SubscriberUnconfirmedTransactionFilter {
    sender?: string;
    recipient?: string;
}
