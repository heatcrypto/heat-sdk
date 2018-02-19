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

import WebSocket from "ws"
import Long from "long"
import ByteBuffer from "bytebuffer"
import * as utils from "./utils"
import { Buffer } from "buffer"
import { callbackify } from "util"

let MAGIC_NUM = 22102010

export interface SocketResponse {
  type: number // 0=response, 33=exception
  buffer: Buffer
}

export class Socket {
  private connectedSocketPromise: Promise<any> = null
  private callIdIncr = 0
  private callbacks: { [key: number]: any } = {}

  constructor(private url: string) {}

  /**
   * Byte layout of rpc invocation
   *
   * --------------------------------------------
   * |field | magic | callid | method | payload |
   * |-------------------------------------------
   * |size  | 4     | 4      | 2      | N       |
   * --------------------------------------------
   */
  public invoke(method: number, request: ArrayBuffer): Promise<SocketResponse> {
    let promise = new Promise((resolve, reject) => {
      let callId = this.callIdIncr++
      this.callbacks[callId] = {
        resolve: resolve,
        reject: reject
      }
      this.getConnectedSocket()
        .then(websocket => {
          let buffer = ByteBuffer.allocate(4 + 4 + 2 + request.byteLength).order(
            ByteBuffer.LITTLE_ENDIAN
          )
          buffer.writeInt32(MAGIC_NUM)
          buffer.writeInt32(callId)
          buffer.writeInt16(method)
          buffer.append(request)
          websocket.send(buffer.buffer)
        })
        .catch(reject)
    })
    return utils.setPromiseTimeout(10 * 1000, promise)
  }

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

  private onMessage(message: any) {
    var buffer = ByteBuffer.wrap(message).order(ByteBuffer.LITTLE_ENDIAN)
    let magicNum = buffer.readInt32()
    let callId = buffer.readInt32()
    let type = buffer.readByte()
    if (magicNum != MAGIC_NUM) {
      console.log("Wrong magic number")
      return
    }
    let cb = this.callbacks[callId]
    if (!cb) {
      console.log(`No such callback callId=${callId}`)
      return
    }
    try {
      let response: SocketResponse = {
        type: type,
        buffer: Buffer.from(message, 9)
      }
      cb.resolve(response)
    } catch (e) {
      console.error(e)
      cb.reject(e)
    }
  }

  private getConnectedSocket() {
    if (this.connectedSocketPromise) {
      return this.connectedSocketPromise
    }
    this.connectedSocketPromise = new Promise((resolve, reject) => {
      var websocket = new WebSocket(this.url, undefined)
      websocket.binaryType = "arraybuffer"
      var onclose = (event: any) => {
        reject(event)
        this.connectedSocketPromise = null
        websocket.onclose = null
        websocket.onopen = null
        websocket.onerror = null
        websocket.onmessage = null
      }
      var onerror = onclose
      var onopen = (event: any) => {
        resolve(websocket)
      }
      var onmessage = (message: any) => {
        // var buffer = new Uint8Array(message.data)
        // this.onMessage(buffer)
        this.onMessage(message.data)
      }
      websocket.onclose = onclose
      websocket.onopen = onopen
      websocket.onerror = onerror
      websocket.onmessage = onmessage
    })
    return this.connectedSocketPromise
  }
}
