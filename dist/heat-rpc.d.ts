import { BroadcastRequest, BroadcastResponse } from "./types";
import { TransactionImpl } from "./builder";
export declare class HeatRpc {
    private socket;
    constructor(url: string);
    private send;
    broadcast(request: BroadcastRequest): Promise<BroadcastResponse>;
    broadcast2(t: TransactionImpl): Promise<BroadcastResponse>;
}
