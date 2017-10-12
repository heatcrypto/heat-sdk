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
import { Builder, TransactionImpl } from "../src/builder"
import { Transaction } from "../src/transaction"
import { ORDINARY_PAYMENT } from "../src/attachment"
import {
  byteArrayToHexString,
  hexStringToByteArray,
  stringToHexString
} from "../src/converters"
import * as crypto from "../src/crypto"
import { HeatSDK, Configuration } from "../src/heat-sdk"

describe("Transaction builder", () => {
  it("can create a payment", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let transaction = heatsdk
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    expect(transaction).toBeInstanceOf(TransactionImpl)
  })
  it("can generate transaction bytes", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let transaction = heatsdk
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getBytesAsHex()
    expect(bytes).toEqual(expect.any(String))
  })
  it("can generate unsigned transaction bytes", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let transaction = heatsdk
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getUnsignedBytes()
    expect(bytes).toEqual(expect.any(Array))
  })
  it("can generate json", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let transaction = heatsdk
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    expect(transaction.getJSONObject()).toEqual({
      type: 0,
      subtype: 0,
      timestamp: expect.any(Number),
      deadline: 1440,
      senderPublicKey:
        "9f349432381a0803cfe795b9e9df645d4b9b990f98d0e545c46ae801dd329d3f",
      recipient: "12345",
      amountHQT: "10020000000",
      feeHQT: "1000000",
      ecBlockHeight: 1,
      ecBlockId: "0",
      signature: expect.any(String),
      attachment: {
        "version.OrdinaryPayment": 0,
        "version.Message": 1,
        message: "Hello world",
        messageIsText: true
      },
      version: 1
    })
  })

  it("can parse transaction bytes", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let transaction = heatsdk
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getBytesAsHex()
    let t2 = TransactionImpl.parse(bytes)
    expect(t2).toBeInstanceOf(TransactionImpl)
    expect(t2.getJSONObject()).toEqual(transaction.getJSONObject())
  })

  it("can parse transaction bytes on the server", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: false }))
    let txn = heatsdk
      .payment("4644748344150906433", "4.0003")
      .publicMessage("Happy birthday!")
    txn.sign(
      "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
    )
    let bytes = txn.getTransaction().getBytesAsHex()
    txn.broadcast()
    let transaction = txn.getTransaction()
    bytes = transaction.getBytesAsHex()
    return heatsdk.api
      .post("/tx/parse", { transactionBytes: bytes })
      .then(response => {
        //console.log(response)
      })
      .catch(response => {
        //console.log(response)
      })
  })

  it("low level build transaction", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
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
    let txn = new Transaction(heatsdk, "33333", builder)
    let transaction = builder.build("hello")
    txn.sign("hello")
    let unsignedBytes = transaction.getUnsignedBytes()
    let signature = transaction.getSignature()
    let bytesHex = transaction.getBytesAsHex()
    expect(bytesHex).toEqual(
      "001080969800a0054b5fe8218c0fda7e65e9c75b85df383ebe26670c16957a5c06748d55000ca75c3582000000000000102700000000000040420f0000000000337275d0a856100beb2138cdbc7e629fe8845eeaf89a3086f867538f43a29201370f3c18134d7418a08d537c12776242e454f7e01d51086763634c312f185a8d00000000e80300004a38234b0100000000ffffffffffffff7f"
    )
    expect(unsignedBytes).toEqual([
      0,
      16,
      128,
      150,
      152,
      0,
      160,
      5,
      75,
      95,
      232,
      33,
      140,
      15,
      218,
      126,
      101,
      233,
      199,
      91,
      133,
      223,
      56,
      62,
      190,
      38,
      103,
      12,
      22,
      149,
      122,
      92,
      6,
      116,
      141,
      85,
      0,
      12,
      167,
      92,
      53,
      130,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      39,
      0,
      0,
      0,
      0,
      0,
      0,
      64,
      66,
      15,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      232,
      3,
      0,
      0,
      74,
      56,
      35,
      75,
      1,
      0,
      0,
      0,
      0,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      127
    ])
    expect(signature).toEqual([
      51,
      114,
      117,
      208,
      168,
      86,
      16,
      11,
      235,
      33,
      56,
      205,
      188,
      126,
      98,
      159,
      232,
      132,
      94,
      234,
      248,
      154,
      48,
      134,
      248,
      103,
      83,
      143,
      67,
      162,
      146,
      1,
      55,
      15,
      60,
      24,
      19,
      77,
      116,
      24,
      160,
      141,
      83,
      124,
      18,
      119,
      98,
      66,
      228,
      84,
      247,
      224,
      29,
      81,
      8,
      103,
      99,
      99,
      76,
      49,
      47,
      24,
      90,
      141
    ])
  })

  it("sign", () => {
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    let bytes = [
      0,
      16,
      -128,
      -106,
      -104,
      0,
      -96,
      5,
      -17,
      -101,
      -81,
      -105,
      -120,
      96,
      -75,
      109,
      106,
      13,
      21,
      99,
      -116,
      -102,
      -15,
      27,
      -26,
      -121,
      -7,
      2,
      48,
      -20,
      -125,
      -97,
      -83,
      118,
      45,
      8,
      95,
      -59,
      101,
      26,
      53,
      -126,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      39,
      0,
      0,
      0,
      0,
      0,
      0,
      64,
      66,
      15,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      -24,
      3,
      0,
      0,
      74,
      56,
      35,
      75,
      1,
      0,
      0,
      0,
      0
    ]
    let secretPhrase =
      "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
    let unsignedHex = byteArrayToHexString(bytes)
    let signatureHex = crypto.signBytes(
      unsignedHex,
      stringToHexString(secretPhrase)
    )
    let signature = hexStringToByteArray(signatureHex)

    let expectedSignature = [
      -68,
      54,
      -124,
      76,
      -84,
      122,
      -118,
      -40,
      -4,
      95,
      -51,
      112,
      50,
      -14,
      103,
      63,
      54,
      103,
      -5,
      21,
      -31,
      -30,
      -99,
      -33,
      -115,
      -102,
      -95,
      -82,
      -10,
      -89,
      -110,
      3,
      -97,
      102,
      36,
      30,
      60,
      -127,
      66,
      80,
      9,
      9,
      -17,
      15,
      -89,
      -84,
      -16,
      26,
      123,
      -3,
      115,
      -90,
      -15,
      54,
      13,
      6,
      -45,
      -58,
      3,
      87,
      -8,
      56,
      -70,
      -41
    ]
    let expectedSignatureHex = byteArrayToHexString(expectedSignature)
    expect(expectedSignatureHex).toEqual(signatureHex)
  })
})
