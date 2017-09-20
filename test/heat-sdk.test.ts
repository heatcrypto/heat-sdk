import heatsdk from "../src/heat-sdk"

describe("Export default test", () => {
  it("Is exported", () => {
    expect(heatsdk).toBeTruthy()
  })
  it("has a crypto property with exported methods", () => {
    expect(heatsdk.crypto.getAccountId("secret phrase")).toBe(
      "7567221445300685906"
    )
  })
})
