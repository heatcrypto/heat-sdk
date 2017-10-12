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
import * as crypto from "./crypto"
import * as utils from "./utils"
import * as attachment from "./attachment"
import { Builder } from "./builder"
import { Transaction } from "./transaction"
import { HeatApi } from "./heat-api"

export class HeatSDKClass {
  constructor(baseURL?: string, testnet?: boolean) {
    this.isTestnet = testnet ? true : false
    let apiBaseURL = baseURL
      ? baseURL
      : this.isTestnet
        ? "https://alpha.heatledger.com:7734/api/v1"
        : "https://heatwallet.com:7734/api/v1"
    this.api = new HeatApi({ baseURL: apiBaseURL })
  }

  public api: HeatApi

  public isTestnet = false

  public crypto = crypto

  public payment(recipientOrRecipientPublicKey: string, amount: string) {
    return new Transaction(
      recipientOrRecipientPublicKey,
      new Builder()
        .isTestnet(this.isTestnet)
        .attachment(attachment.ORDINARY_PAYMENT)
        .amountHQT(utils.convertToQNT(amount))
    )
  }
}

let sdk: HeatSDKClass

export function initHeatSDK(baseURL?: string, testnet?: boolean) {
  if (!sdk) sdk = new HeatSDKClass(baseURL, testnet)
  else throw Error("Heat SDK already initialized")
}

export default function heatsdk(): HeatSDKClass {
  if (!sdk) throw Error("Heat SDK needs initialized first")
  return sdk
}
