///<reference path="../node_modules/@types/jest/index.d.ts"/>
import { Configuration, HeatSDK } from "../src/heat-sdk"
import * as crypto from "../src/crypto"

let secretPhrase1 = "floor battle paper consider stranger blind alter blur bless wrote prove cloud"
let account1 = "2068178321230336428"
let secretPhrase2 = "heat sdk test secret phrase"
let account2 = "5056413637982060108"
let asset1 = "15059693286990371127"
let asset2 = "3829083721650641771"
let currency0 = "0"
let currency1 = "1122"

function handleResult(promise: Promise<any>) {
  //todo. Now just print heat api response
  promise.then(data => console.log(data)).catch(reason => console.log(reason))
}

/* the tests passes until the account balance has the money */

describe("Transaction API", () => {
  const heatsdk = new HeatSDK(
    new Configuration({
      isTestnet: true,
      useWebsocket: true,
      baseURL: "http://localhost:7733/api/v1",
      websocketURL: "ws://localhost:7755/ws/"
    })
  )

  it("broadcast payment", () => {
    /* the test passes until the account balance has the money */
    let promise = heatsdk
      .payment("4644748344150906433", "0.002")
      .publicMessage("Happy birthday!")
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast arbitrary message", () => {
    let promise = heatsdk
      .arbitraryMessage("4644748344150906433", "Qwerty Йцукен")
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast private message", () => {
    let promise = heatsdk
      .privateMessage(crypto.secretPhraseToPublicKey("user1"), "Private Info")
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast private message to self", () => {
    let promise = heatsdk
      .privateMessageToSelf("Private message to self")
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Asset Issuance", () => {
    let promise = heatsdk
      .assetIssuance("https://heatsdktest/assetN01", null, "1000", 0, true)
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Asset Transfer", () => {
    let promise = heatsdk
      .assetTransfer(account2, "1047478663291988214", "4")
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
    //transfer back
    promise = heatsdk
      .assetTransfer(account1, "1047478663291988214", "4")
      .sign(secretPhrase2)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Whitelist Account Addition", () => {
    let promise = heatsdk
      .whitelistAccountAddition(asset1, account1, 1000000000)
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Whitelist Account Removal", () => {
    let promise = heatsdk
      .whitelistAccountRemoval(asset1, account1)
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Whitelist Market", () => {
    let promise = heatsdk
      .whitelistMarket(currency1, account1)
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Effective Balance Leasing", () => {
    let promise = heatsdk
      .effectiveBalanceLeasing(123)
      .sign(secretPhrase1)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })
})
