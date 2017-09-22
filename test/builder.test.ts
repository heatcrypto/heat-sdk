import * as heatsdk from "../src/heat-sdk"
import { Builder, TransactionImpl } from "../src/builder"

describe("Transaction builder", () => {
  it("can create a payment", () => {
    let transaction = heatsdk.default
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    expect(transaction).toBeInstanceOf(TransactionImpl)
  })
  it("can generate transaction bytes", () => {
    let transaction = heatsdk.default
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getBytesAsHex()
    expect(bytes).toEqual(expect.any(String))
  })
  it("can generate unsigned transaction bytes", () => {
    let transaction = heatsdk.default
      .payment("12345", "100.2")
      .publicMessage("Hello world")
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getUnsignedBytes()
    expect(bytes).toEqual(expect.any(Array))
  })
  it("can generate json", () => {
    let transaction = heatsdk.default
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
    let transaction = heatsdk.default
      .payment("12345", "100.2") /*.publicMessage("Hello world")*/
      .sign("secret phrase")
      .getTransaction()
    let bytes = transaction.getBytesAsHex()
    let t2 = TransactionImpl.parse(bytes)
    expect(t2).toBeInstanceOf(TransactionImpl)
    expect(t2.getJSONObject()).toEqual(transaction.getJSONObject())
  })
})
