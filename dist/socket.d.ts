/// <reference types="node" />
export interface SocketResponse {
    type: number;
    buffer: Buffer;
}
export declare class Socket {
    private url;
    private connectedSocketPromise;
    private callIdIncr;
    private callbacks;
    constructor(url: string);
    /**
     * Byte layout of rpc invocation
     *
     * --------------------------------------------
     * |field | magic | callid | method | payload |
     * |-------------------------------------------
     * |size  | 4     | 4      | 2      | N       |
     * --------------------------------------------
     */
    invoke(method: number, request: ArrayBuffer): Promise<SocketResponse>;
    /**
     * Byte layout of rpc response
     *
     * --------------------------------------------
     * |field | magic | callid | type | payload |
     * |-------------------------------------------
     * |size  | 4     | 4      | 1    | N       |
     * --------------------------------------------
     *
     * The type field is either byte:0 (success) or byte:33 (failure). In case of
     * success payload is response object, in case of failure is error object and
     * needs to be decoded with error decoder.
     */
    private onMessage;
    private getConnectedSocket;
}
