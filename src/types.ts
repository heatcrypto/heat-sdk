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

import { Type } from "./avro"

export interface RpcError {
  exceptionClass: string
  message: string
}
export let RpcErrorType = Type.forSchema({
  type: "record",
  fields: [{ name: "exceptionClass", type: "string" }, { name: "message", type: "string" }]
})

export interface Transaction {
  type: number
  subtype: number
  version: number
  timestamp: number
  deadline: number
  senderPublicKey: Uint8Array
  recipientId: Long
  amountHQT: Long
  feeHQT: Long
  signature: Uint8Array
  flags: number
  ecBlockHeight: number
  ecBlockId: Long
  attachmentBytes: Uint8Array
  appendixBytes: Uint8Array
}
export let TransactionType = Type.forSchema({
  type: "record",
  fields: [
    { name: "type", type: "int" },
    { name: "subtype", type: "int" },
    { name: "version", type: "int" },
    { name: "timestamp", type: "int" },
    { name: "deadline", type: "int" },
    { name: "senderPublicKey", type: "bytes", size: 32 },
    { name: "recipientId", type: "long" },
    { name: "amountHQT", type: "long" },
    { name: "feeHQT", type: "long" },
    { name: "signature", type: "bytes", size: 64 },
    { name: "flags", type: "int" },
    { name: "ecBlockHeight", type: "int" },
    { name: "ecBlockId", type: "long" },
    { name: "attachmentBytes", type: "bytes" },
    { name: "appendixBytes", type: "bytes" }
  ]
})

export interface BroadcastRequest {
  transaction: Transaction
}
export let BroadcastRequestType = Type.forSchema({
  type: "record",
  fields: [
    {
      name: "transaction",
      type: TransactionType.schema()
    }
  ]
})

export interface BroadcastResponse {
  transaction: Long
}
export let BroadcastResponseType = Type.forSchema({
  type: "record",
  fields: [
    {
      name: "transaction",
      type: "long"
    }
  ]
})
