///<reference path="../node_modules/@types/jest/index.d.ts"/>
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
import { Configuration, HeatSDK } from "../src/heat-sdk"
import { BroadcastRequestType, Transaction, TransactionType } from "../src/types"
import { Type } from "../src/avro"
import { Builder } from "../src/builder"
import { ORDINARY_PAYMENT } from "../src/attachment"

const Long = require("long")

function handleResult(promise: Promise<any>) {
  return promise
    .then(response => {
      console.log(response)
      expect(response).toBeDefined()
    })
    .catch(reason => console.log(reason))
}

describe("avro", () => {
  it("can create a schema", () => {
    let type = Type.forSchema({
      type: "record",
      fields: [
        { name: "foo", type: "int" },
        { name: "bar", type: "long" },
        { name: "string", type: "string" },
        { name: "int", type: "int" },
        { name: "bytes", type: "bytes" }
      ]
    })
    let object = {
      foo: 1000,
      bar: Long.fromString("1"),
      string: "hello",
      int: 10000,
      bytes: new Buffer(100)
    }
    expect(type).toBeDefined()
    let buffer = type.toBuffer(object)
    expect(buffer).toBeDefined()
    let val = type.fromBuffer(buffer)
    expect(val).toEqual(object)
  })
})

describe("heat-rpc", () => {
  const config = new Configuration({
    isTestnet: true
  })

  const heatsdk = new HeatSDK(config)

  let transaction: Transaction = {
    type: 0,
    subtype: 0,
    version: 1,
    timestamp: 22222222,
    deadline: 1440,
    senderPublicKey: new Buffer(new Uint8Array(32)),
    recipientId: Long.fromString("1"),
    amountHQT: Long.fromString("2"),
    feeHQT: Long.fromString("1000000"),
    signature: new Buffer(new Uint8Array(64)),
    flags: 0,
    ecBlockHeight: 0,
    ecBlockId: Long.fromString("4"),
    attachmentBytes: new Buffer(new Uint8Array(0)),
    appendixBytes: new Buffer(new Uint8Array(0))
  }

  it("can use TransactionType", () => {
    let builder = new Builder()
      .attachment(ORDINARY_PAYMENT)
      .amountHQT("10000")
      .timestamp(10000000)
      .deadline(1440)
      .feeHQT("1000000")
      .ecBlockHeight(1000)
      .ecBlockId("5555566666")
      .recipientId("33333")
      .isTestnet(true)
    let transaction = builder.build("hello").getRaw()
    let buffer = TransactionType.toBuffer(transaction)
    expect(buffer).toBeDefined()
    let val = TransactionType.fromBuffer(buffer)
    expect(val).toEqual(transaction)
  })

  it("can use BroadcastRequestType", () => {
    let object = { transaction: transaction }
    let buffer = BroadcastRequestType.toBuffer(object)
    expect(buffer).toBeDefined()
    let val = BroadcastRequestType.fromBuffer(buffer)
    expect(val).toEqual(object)
  })

  it("can broadcast a payment", () => {
    let promise = heatsdk
      .payment("2068178321230336428", "0.02")
      .publicMessage("Hello world")
      .sign("heat sdk test secret phrase")
      .then(t => heatsdk.rpc.broadcast({ transaction: t.getTransaction().getRaw() }))
    handleResult(promise)
  })

  it("can broadcast a payment 2", () => {
    let promise = heatsdk
      .payment("2068178321230336428", "0.02")
      .publicMessage("Hello world")
      .sign("heat sdk test secret phrase")
      .then(t => heatsdk.rpc.broadcast2(t.getTransaction()))
    return handleResult(promise)
  })

  // it("can create multi payments", () => {
  //   var count = 200
  //   console.log("Generate " + count + " transactions")
  //   return createTransactions(heatsdk, 100)
  //     .then(transactions => {
  //       console.log("Done generating " + count + " transactions")
  //       var promises = []
  //       transactions.forEach(t => {
  //         promises.push(
  //           heatsdk.rpc.broadcast2(t).then(resp => {
  //             //console.log(t. resp)
  //           })
  //         )
  //       })
  //       console.log("Done broadcasting " + count + " transactions")
  //       return Promise.all(promises)
  //     })
  //     .then(() => {
  //       console.log("Received back all callbacks")
  //     })
  // })
})

function pad(num, size) {
  var s = "00000000" + num
  return s.substr(s.length - size)
}

function createTransactions(heatsdk, count) {
  var promises = []
  var transactions = []
  for (let i = 0; i < count; i++) {
    promises.push(
      heatsdk
        .payment("4729421738299387565", "1." + pad(i, 5))
        //.publicMessage("Hello world")
        .sign("secret-phrase")
        .then(t => {
          transactions.push(t.getTransaction())
        })
    )
  }
  return Promise.all(promises).then(function() {
    return transactions
  })
}
