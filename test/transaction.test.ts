import heatsdk, { initHeatSDK } from "../src/heat-sdk"
import { IBroadcastOutput } from "../src/transaction"

initHeatSDK("http://alpha.heatledger.com:7733/api/v1", true)

describe("Transaction API", () => {
  it("broadcast transaction", () => {
    /* the test passes until the account balance has the money */
    heatsdk()
      .payment("4644748344150906433", "0.002")
      .publicMessage("Happy birthday!")
      .sign(
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
      .broadcast()
      .then((data: IBroadcastOutput) => {
        console.log(data)
      })
      .catch(reason => console.log(reason))
  })
})
