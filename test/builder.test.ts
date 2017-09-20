import * as heatsdk from "../src/heat-sdk"
import { Builder } from "../src/builder"

describe("Transaction builder", () => {
  it("can be created", () => {
    expect(heatsdk.default.createTransactionBuilder()).toBeInstanceOf(Builder)
  })
  it("can create a payment", () => {})
})
