import { heatsdk } from "../src/heat-sdk"
import { Builder } from "../src/builder"

describe("Transaction builder", () => {
  it("can be created", () => {
    expect(heatsdk.createTransactionBuilder()).toBeInstanceOf(Builder)
  })
})
