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
import "./jasmine"
import {Configuration, HeatSDK} from "../src/heat-sdk"
import {BroadcastRequestType, Transaction} from "../src/types"
import {Type} from "../src/avro"

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
    isTestnet: true
    // baseURL: "http://localhost:7733/api/v1",
    // websocketURL: "ws://localhost:7755/ws/"
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
    feeHQT: Long.fromString("3"),
    signature: new Buffer(new Uint8Array(64)),
    flags: 0,
    ecBlockHeight: 0,
    ecBlockId: Long.fromString("4"),
    attachmentBytes: new Buffer(new Uint8Array(0)),
    appendixBytes: new Buffer(new Uint8Array(0))
  }

  it("can use BroadcastRequestType", () => {
    let object = { transaction: transaction, transactions: null }
    let buffer = BroadcastRequestType.toBuffer(object)
    expect(buffer).toBeDefined()
    let val = BroadcastRequestType.fromBuffer(buffer)
    expect(val).toEqual(object)
  })

  // it("can invoke stuff", () => {
  //   return heatsdk.rpc.broadcast({transaction:transaction})
  //     .then(response => {
  //       console.log(response)
  //       expect(response).toBeDefined()
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })
  //     .then(() => {})
  // })

  it("can create a payment", async () => {
    let t = await heatsdk
      .payment("1111", "10")
      .publicMessage("Hello world")
      .sign("generator")

    let transaction = t.getTransaction()
    let response = await heatsdk.rpc.broadcast2(transaction)
    expect(response).toBeDefined()
  })

  it("can send payments", async done => {
    let start = Date.now()
    let count = 3
    try {
      let transactions = await createTransactions(heatsdk, count)
      for (const t of transactions) {
        //let resp = await heatsdk.rpc.broadcast2(t)
        let resp = await heatsdk.rpc.broadcast({transaction: t.getRaw()})
        //let resp = await heatsdk.rpc.broadcast({transactions: [t.getRaw()]})
        //console.log(t.amountHQT, resp,  (Date.now() - start), new Date())
      }
    } catch (e) {
      done(e)
    }
    done()
  })

  it("can send one time multi payments", async done => {
    let count = 3
    try {
      let transactions = await createTransactions(heatsdk, count)
      let resp = await heatsdk.rpc.broadcast({transactions: transactions.map(t => t.getRaw())})
      //let resp = await heatsdk.rpc.broadcast3(transactions)
    } catch (e) {
      done(e)
    }
    done()
  })

  it("can close socket", async () => {
    let response = await heatsdk.rpc.broadcast2(
      (await heatsdk
        .payment("1111", "10")
        .publicMessage("Hello world")
        .sign("generator")).getTransaction()
    )
    expect(response).toBeDefined()

    //now we have the opened websocket, try to close it
    await heatsdk.rpc.closeSocket()
  })
})

function pad(num, size) {
  var s = "00000000" + num
  return s.substr(s.length - size)
}

function createTransactions(heatsdk, count) {
  var promises = []
  var transactions = []
  for (let i = 1; i < count + 1; i++) {
    promises.push(
      heatsdk
        .payment("4729421738299387565", "1." + pad(i, 5))
        //.publicMessage("Hello world")
        .sign("user3")
        .then(t => {
          transactions.push(t.getTransaction())
        })
    )
  }
  return Promise.all(promises).then(function() {
    return transactions
  })
}
