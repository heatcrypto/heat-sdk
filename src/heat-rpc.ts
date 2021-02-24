/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Heat Ledger Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */
import {
  RpcError,
  RpcErrorType,
  Transaction,
  TransactionType,
  BroadcastRequest,
  BroadcastRequestType,
  BroadcastResponse,
  BroadcastResponseType
} from "./types"
import { Socket, SocketResponse } from "./socket"
import { TransactionImpl } from "./builder"
import { Buffer } from "buffer"

let TYPE_RESP = 0
let TYPE_ERR = 33

interface RemoteProcedure<R1, R2> {
  method: number
  request: any // avro.Type
  response: any // avro.Type
}

export class HeatRpc {
  private socket: Socket

  constructor(url: string) {
    this.socket = new Socket(url)
  }

  private send(proc: RemoteProcedure<any, any>, request: any): Promise<any> {
    let bufferIn = proc.request.toBuffer(request)
    return this.socket.invoke(proc.method, bufferIn).then(response => {
      if (response.type == TYPE_RESP) return proc.response.fromBuffer(response.buffer)
      else if (response.type == TYPE_ERR) return RpcErrorType.fromBuffer(response.buffer)

      console.log(`Wrong type arg ${response.type}`)
      return null
    })
  }

  public broadcast(request: BroadcastRequest): Promise<BroadcastResponse> {
    return this.send(
      { method: 1, request: BroadcastRequestType, response: BroadcastResponseType },
      request
    )
  }

  public broadcast2(t: TransactionImpl): Promise<BroadcastResponse> {
    return this.send(
      { method: 1, request: BroadcastRequestType, response: BroadcastResponseType },
      { transaction: t.getRaw() }
    )
  }

  public broadcast3(transactions: TransactionImpl[]): Promise<BroadcastResponse> {
    return this.send(
      { method: 1, request: BroadcastRequestType, response: BroadcastResponseType },
      { transactions: transactions.map(v => v.getRaw()) }
    )
  }

  /**
   * Sometimes may be need do not keep opened websocket a long time.
   * For example the app could broadcast one transaction and work further with no need heat sdk at all.
   * Note, any new sending will open the websocket again.
   */
  public async closeSocket() {
    await this.socket.close()
  }
}
