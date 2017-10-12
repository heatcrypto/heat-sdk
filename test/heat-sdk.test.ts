import heatsdk, { initHeatSDK } from "../src/heat-sdk"

initHeatSDK("http://alpha.heatledger.com:7733/api/v1", true)

describe("Export default test", () => {
  it("Is exported", () => {
    expect(heatsdk()).toBeTruthy()
  })
  it("has a crypto property with exported methods", () => {
    expect(heatsdk().crypto.getAccountId("secret phrase")).toBe(
      "7567221445300685906"
    )
  })
})
