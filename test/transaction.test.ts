/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Heat Ledger Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */

import { testnet } from "./testnet"
import { Configuration, HeatSDK } from "../src/heat-sdk"
import { IBroadcastOutput } from "../src/transaction"
import * as crypto from "../src/crypto"

function handleResult(promise: Promise<any>) {
  //todo. Now just print heat api response
  promise.then((data: IBroadcastOutput) => console.log(data)).catch(reason => console.log(reason))
}

/* the tests passes until the account balance has the money */

describe("Transaction API", () => {
  const heatsdk = new HeatSDK(new Configuration({ isTestnet: true }))

  it("broadcast payment", () => {
    /* the test passes until the account balance has the money */
    let promise = heatsdk
      .payment("4644748344150906433", "0.002")
      .publicMessage("Happy birthday!")
      .sign(testnet.ACCOUNT_1.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast arbitrary message", () => {
    let promise = heatsdk
      .arbitraryMessage("4644748344150906433", "Qwerty Йцукен")
      .sign(testnet.ACCOUNT_1.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast private message", () => {
    let promise = heatsdk
      .privateMessage(crypto.secretPhraseToPublicKey("user1"), "Private Info")
      .sign(testnet.ACCOUNT_1.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("broadcast private message to self", () => {
    let promise = heatsdk
      .privateMessageToSelf("Private message to self")
      .sign(testnet.ACCOUNT_1.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Asset Issuance", () => {
    let promise = heatsdk
      .assetIssuance("https://heatsdktest/assetN01", null, "1000", 0, true)
      .sign(testnet.ACCOUNT_1.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })

  it("Asset Transfer", () => {
    let promise = heatsdk
      .assetTransfer(testnet.ASSET_2.ISSUER.ID, testnet.ASSET_1.ID, "4")
      .sign(testnet.ASSET_1.ISSUER.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
    //transfer back
    promise = heatsdk
      .assetTransfer(testnet.ASSET_1.ISSUER.ID, testnet.ASSET_1.ID, "4")
      .sign(testnet.ASSET_2.ISSUER.SECRET_PHRASE)
      .then(transaction => transaction.broadcast())
    handleResult(promise)
  })
})
