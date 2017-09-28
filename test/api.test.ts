import heatsdk from "../src/heat-sdk"
import { HeatApiError } from "../src/heat-api"

describe("heat-api", () => {
  it("can GET stuff", () => {
    return heatsdk.api.get("/blockchain/status").then((data: any) => {
      expect(data.application).toBe("HEAT")
    })
  })
  it("can POST stuff", () => {
    let params = {
      period: "1440",
      fee: "1000000",
      deadline: "1440",
      secretPhrase: "test works as long as no one uses this secretphrase"
    }
    return heatsdk.api.post("/tx/lease", params).catch((data: HeatApiError) => {
      expect(data.errorDescription).toBe("Unknown account")
      expect(data.errorCode).toBe(3)
    })
  })
})
