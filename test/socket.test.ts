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
import { Builder, TransactionImpl } from "../src/builder"
import { ORDINARY_PAYMENT } from "../src/attachment"
import * as crypto from "../src/crypto"

const Long = require("long")

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
    isTestnet: true,
    baseURL: "http://localhost:7733/api/v1",
    websocketURL: "ws://localhost:7755/ws/"
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
    return handleResult(promise)
  })

  it("can broadcast a payment 2", () => {
    let promise = heatsdk
      .payment("2068178321230336428", "0.02")
      .publicMessage("Hello world")
      .sign("heat sdk test secret phrase")
      .then(t => {
        heatsdk.rpc.broadcast2(t.getTransaction())
      })
    return handleResult(promise)
  })

  it("can create multi payments", () => {
    let count = 3
    console.log("Generate " + count + " transactions")
    return createTransactions(heatsdk, count)
      .then(transactions => {
        console.log("Done generating " + count + " transactions")
        let promises: any[] = []
        transactions.forEach(t => {
          promises.push(
            heatsdk.rpc.broadcast2(t)
            /*heatsdk.rpc.broadcast2(t).then(resp => {
              //console.log(t. resp)
            })*/
          )
        })
        console.log("Done broadcasting " + count + " transactions")
        return Promise.all(promises)
      })
      .then(() => {
        console.log("Received back all callbacks")
      })
  })

  it("can use TransactionType for ORDINARY_PAYMENT", () => {
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
    testType(builder.build("hello"))
  })

  it("can use TransactionType for ARBITRARY_MESSAGE", () => {
    let promise = heatsdk
      .arbitraryMessage(account2, "Qwerty Йцукен")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Private Message", () => {
    let promise = heatsdk
      .privateMessage(crypto.secretPhraseToPublicKey(secretPhrase1), "Private Info")
      .sign(secretPhrase2)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Private Message to self", () => {
    let promise = heatsdk
      .privateMessageToSelf("Private message to self")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Asset Issuance", () => {
    heatsdk
      .assetIssuance("https://heatsdktest/assetN01", null, "1000", 0, true)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Asset Issue More", () => {
    heatsdk
      .assetIssueMore("123456789", "100500")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Asset Transfer", () => {
    heatsdk
      .assetTransfer(account2, "3829083721650641771", "4")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Ask Placing", () => {
    heatsdk
      .placeAskOrder("0", "1284030860920393989", "2", "700000000", 3600)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Bid Placing", () => {
    heatsdk
      .placeBidOrder("0", "1284030860920393989", "2", "700000000", 3600)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Ask Cancellation", () => {
    heatsdk
      .cancelAskOrder("1234567890123456789")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Bid Cancellation", () => {
    heatsdk
      .cancelBidOrder("1234567890123456789")
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Whitelist Account Addition", () => {
    heatsdk
      .whitelistAccountAddition(asset1, account1, 1000000000)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Whitelist Account Removal", () => {
    heatsdk
      .whitelistAccountRemoval(asset1, account1)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Whitelist Market", () => {
    heatsdk
      .whitelistMarket(currency1, asset1)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })

  it("can use TransactionType for Effective Balance Leasing", () => {
    heatsdk
      .effectiveBalanceLeasing(12345)
      .sign(secretPhrase1)
      .then(t => testType(t.getTransaction()))
  })
})

let secretPhrase1 = "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
let account1 = "2068178321230336428"
let secretPhrase2 = "heat sdk test secret phrase"
let account2 = "5056413637982060108"
let asset1 = "1234567890123456789"
let currency0 = "0"
let currency1 = "1111111111111"

function pad(num: number, size: number) {
  let s = "00000000" + num
  return s.substr(s.length - size)
}

function createTransactions(heatsdk: HeatSDK, count: number) {
  let promises = []
  let transactions: TransactionImpl[] = []
  for (let i = 0; i < count; i++) {
    promises.push(
      heatsdk
        .payment("2068178321230336428", "1." + pad(i, 5))
        .sign(secretPhrase2)
        .then(t => {
          transactions.push(t.getTransaction())
        })
    )
  }
  return Promise.all(promises).then(function() {
    return transactions
  })
}

function handleResult(promise: Promise<any>) {
  return promise.then(v => expect(v).toBeDefined()).catch(reason => console.log(reason))
}

function testType(t: TransactionImpl) {
  let transaction = t.getRaw()
  let buffer = TransactionType.toBuffer(transaction)
  expect(buffer).toBeDefined()
  let val = TransactionType.fromBuffer(buffer)
  expect(val).toEqual(transaction)
  return transaction
}
