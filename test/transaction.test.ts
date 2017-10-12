import { HeatSDK, Configuration } from "../src/heat-sdk"

describe("Transaction API", () => {
  it("broadcast transaction", () => {
    /* the test passes until the account balance has the money */
    const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))
    heatsdk
      .payment("4644748344150906433", "0.002")
      .publicMessage("Happy birthday!")
      .sign(
        "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
      )
      .broadcast()
      .then(data => {
        console.log(data)
      })
      .catch(reason => console.log(reason))
  })
})
