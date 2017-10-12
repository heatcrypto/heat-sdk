import heatsdk, { initHeatSDK } from "../src/heat-sdk"
import { Builder, TransactionImpl } from "../src/builder"
import { Transaction } from "../src/transaction"
import { ORDINARY_PAYMENT } from "../src/attachment"
import {
  byteArrayToHexString,
  hexStringToByteArray,
  stringToHexString
} from "../src/converters"
import * as crypto from "../src/crypto"

initHeatSDK("http://localhost:7733/api/v1", true)

describe("Transaction builder", () => {
  it("can create a payment", () => {
    let transaction = heatsdk()
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    expect(transaction).toBeInstanceOf(TransactionImpl)
  })
  it("can generate transaction bytes", () => {
    let transaction = heatsdk()
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getBytesAsHex()
    expect(bytes).toEqual(expect.any(String))
  })
  it("can generate unsigned transaction bytes", () => {
    let transaction = heatsdk()
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getUnsignedBytes()
    expect(bytes).toEqual(expect.any(Array))
  })
  it("can generate json", () => {
    let transaction = heatsdk()
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
    let transaction = heatsdk()
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
    let txn = heatsdk()
      .payment("4644748344150906433", "4.0003")
      .publicMessage("Happy birthday!")
    txn.sign(
      "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
    )
    let bytes = txn.getTransaction().getBytesAsHex()
    console.log(`bytes: ${bytes}`)
    txn.broadcast()
    let transaction = txn.getTransaction()
    bytes = transaction.getBytesAsHex()
    return heatsdk()
      .api.post("/tx/parse", { transactionBytes: bytes })
      .then(response => {
        console.log(response)
      })
      .catch(response => {
        console.log(response)
      })
  })

  it("low level build transaction", () => {
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
    let txn = new Transaction("33333", builder)
    let transaction = builder.build("hello")
    txn.sign("hello")
    let unsignedBytes = transaction.getUnsignedBytes()
    let signature = transaction.getSignature()
    let bytesHex = transaction.getBytesAsHex()
    console.log(
      `txn:\nbytes: ${bytesHex}\nunsignedBytes: ${unsignedBytes}\nsignature: ${signature}`
    )
  })

  it("sign", () => {
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
    console.log(signatureHex)
    console.log(expectedSignatureHex)

    expect(expectedSignatureHex).toEqual(signatureHex)
  })
})
