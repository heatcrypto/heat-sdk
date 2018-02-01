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
import * as converters from "./converters"
import * as crypto from "./crypto"
import * as utils from "./utils"
import * as attachment from "./attachment"
import {
  AccountControlEffectiveBalanceLeasing,
  AssetIssuance,
  AssetIssueMore,
  AssetTransfer,
  ColoredCoinsAskOrderCancellation,
  ColoredCoinsAskOrderPlacement,
  ColoredCoinsBidOrderCancellation,
  ColoredCoinsBidOrderPlacement,
  ColoredCoinsWhitelistAccountRemoval,
  ColoredCoinsWhitelistMarket
} from "./attachment"
import { Builder, TransactionImpl } from "./builder"
import { Transaction } from "./transaction"
import { HeatApi } from "./heat-api"
import { HeatSubscriber } from "./heat-subscriber"
import { SecretGenerator } from "./secret-generator"
import { Fee } from "./fee"
import { setRandomSource } from "./random-bytes"
import { HeatRpc } from "./heat-rpc"
import { WhitelistAccountAddition } from "./transaction-type"
import { ColoredCoinsWhitelistAccountAddition } from "./attachment"

export interface ConfigArgs {
  isTestnet?: boolean
  baseURL?: string
  websocketURL?: string
  useWebsocket?: boolean
}

export class Configuration {
  isTestnet = false
  baseURL: string
  websocketURL: string
  useWebsocket = false
  constructor(args?: ConfigArgs) {
    if (args) {
      if (utils.isDefined(args.isTestnet)) this.isTestnet = !!args.isTestnet
      if (utils.isDefined(args.baseURL)) this.baseURL = <string>args.baseURL
      if (utils.isDefined(args.websocketURL)) this.websocketURL = <string>args.websocketURL
      if (utils.isDefined(args.useWebsocket)) this.useWebsocket = !!args.useWebsocket
    }
    if (!utils.isDefined(this.baseURL))
      this.baseURL = this.isTestnet
        ? "https://alpha.heatledger.com:7734/api/v1"
        : "https://heatwallet.com:7734/api/v1"
    if (!utils.isDefined(this.websocketURL))
      this.websocketURL = this.isTestnet
        ? "wss://alpha.heatledger.com:7755/ws/"
        : "wss://heatwallet.com:7755/ws/"
    if (this.useWebsocket && !this.websocketURL)
      throw new Error("Websocket URL in Configuration is not defined")
  }
}

export class HeatSDK {
  public api: HeatApi
  public subscriber: HeatSubscriber
  public rpc: HeatRpc
  public utils = utils
  public crypto = crypto
  public converters = converters
  public config: Configuration
  public secretGenerator = new SecretGenerator()
  public setRandomSource = setRandomSource

  constructor(config?: Configuration) {
    const config_ = config ? config : new Configuration()
    this.config = config_
    this.api = new HeatApi({ baseURL: this.config.baseURL })
    this.subscriber = new HeatSubscriber(this.config.websocketURL)
    this.rpc = new HeatRpc(this.config.websocketURL)
  }

  public parseTransactionBytes(transactionBytesHex: string) {
    return TransactionImpl.parse(transactionBytesHex, this.config.isTestnet)
  }

  public parseTransactionJSON(json: { [key: string]: any }) {
    return TransactionImpl.parseJSON(json, this.config.isTestnet)
  }

  public passphraseEncrypt(plainText: string, passphrase: string) {
    return crypto.passphraseEncrypt(plainText, passphrase).encode()
  }

  public passphraseDecrypt(cipherText: string, passphrase: string) {
    let encrypted = crypto.PassphraseEncryptedMessage.decode(cipherText)
    return crypto.passphraseDecrypt(encrypted, passphrase)
  }

  public payment(recipientOrRecipientPublicKey: string, amount: string) {
    return new Transaction(
      this,
      recipientOrRecipientPublicKey,
      new Builder()
        .isTestnet(this.config.isTestnet)
        .attachment(attachment.ORDINARY_PAYMENT)
        .amountHQT(utils.convertToQNT(amount))
    )
  }

  public arbitraryMessage(recipientOrRecipientPublicKey: string, message: string) {
    return new Transaction(
      this,
      recipientOrRecipientPublicKey,
      new Builder()
        .isTestnet(this.config.isTestnet)
        .attachment(attachment.ARBITRARY_MESSAGE)
        .amountHQT("0")
    ).publicMessage(message)
  }

  public privateMessage(recipientPublicKey: string, message: string) {
    return new Transaction(
      this,
      recipientPublicKey,
      new Builder()
        .isTestnet(this.config.isTestnet)
        .attachment(attachment.ARBITRARY_MESSAGE)
        .amountHQT("0")
    ).privateMessage(message)
  }

  public privateMessageToSelf(message: string) {
    return new Transaction(
      this,
      null, // if null and provide private message then to send encrypted message to self
      new Builder()
        .isTestnet(this.config.isTestnet)
        .attachment(attachment.ARBITRARY_MESSAGE)
        .amountHQT("0")
    ).privateMessageToSelf(message)
  }

  public assetIssuance(
    descriptionUrl: string,
    descriptionHash: number[],
    quantity: string,
    decimals: number,
    dillutable: boolean,
    feeHQT?: string
  ) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(
        new AssetIssuance().init(descriptionUrl, descriptionHash, quantity, decimals, dillutable)
      )
      .amountHQT("0")
      .feeHQT(feeHQT ? feeHQT : Fee.ASSET_ISSUANCE_FEE)
    return new Transaction(this, "0", builder)
  }

  public assetIssueMore(assetId: string, quantity: string, feeHQT?: string) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new AssetIssueMore().init(assetId, quantity))
      .amountHQT("0")
      .feeHQT(feeHQT ? feeHQT : Fee.ASSET_ISSUE_MORE_FEE)
    return new Transaction(this, "0", builder)
  }

  public assetTransfer(
    recipientOrRecipientPublicKey: string,
    assetId: string,
    quantity: string,
    feeHQT?: string
  ) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new AssetTransfer().init(assetId, quantity))
      .amountHQT("0")
      .feeHQT(feeHQT ? feeHQT : Fee.ASSET_TRANSFER_FEE)
    return new Transaction(this, recipientOrRecipientPublicKey, builder)
  }

  public placeAskOrder(
    currencyId: string,
    assetId: string,
    quantity: string,
    price: string,
    expiration: number
  ) {
    return this.placeOrder(true, currencyId, assetId, quantity, price, expiration)
  }

  public placeBidOrder(
    currencyId: string,
    assetId: string,
    quantity: string,
    price: string,
    expiration: number
  ) {
    return this.placeOrder(false, currencyId, assetId, quantity, price, expiration)
  }

  public cancelAskOrder(orderId: string) {
    return this.cancelOrder(true, orderId)
  }

  public cancelBidOrder(orderId: string) {
    return this.cancelOrder(false, orderId)
  }

  public whitelistAccountAddition(assetId: string, accountId: string, endHeight: number) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new ColoredCoinsWhitelistAccountAddition().init(assetId, accountId, endHeight))
      .amountHQT("0")
      .feeHQT(Fee.WHITELIST_ACCOUNT_FEE)
    return new Transaction(this, "0", builder)
  }

  public whitelistAccountRemoval(assetId: string, accountId: string) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new ColoredCoinsWhitelistAccountRemoval().init(assetId, accountId))
      .amountHQT("0")
      .feeHQT(Fee.WHITELIST_ACCOUNT_FEE)
    return new Transaction(this, "0", builder)
  }

  public whitelistMarket(currencyId: string, assetId: string) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new ColoredCoinsWhitelistMarket().init(currencyId, assetId))
      .amountHQT("0")
      .feeHQT(Fee.WHITELIST_MARKET_FEE)
    return new Transaction(this, "0", builder)
  }

  public effectiveBalanceLeasing(period: number) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(new AccountControlEffectiveBalanceLeasing().init(period))
      .amountHQT("0")
      .feeHQT(Fee.EFFECTIVE_BALANCE_LEASING_FEE)
    return new Transaction(this, "0", builder)
  }

  private placeOrder(
    ask: boolean,
    currencyId: string,
    assetId: string,
    quantity: string,
    price: string,
    expiration: number
  ) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(
        ask
          ? new ColoredCoinsAskOrderPlacement().init(
              currencyId,
              assetId,
              quantity,
              price,
              expiration
            )
          : new ColoredCoinsBidOrderPlacement().init(
              currencyId,
              assetId,
              quantity,
              price,
              expiration
            )
      )
      .amountHQT("0")
      .feeHQT(Fee.ORDER_PLACEMENT_FEE)
    return new Transaction(this, "0", builder)
  }

  private cancelOrder(ask: boolean, orderId: string) {
    let builder = new Builder()
      .isTestnet(this.config.isTestnet)
      .attachment(
        ask
          ? new ColoredCoinsAskOrderCancellation().init(orderId)
          : new ColoredCoinsBidOrderCancellation().init(orderId)
      )
      .amountHQT("0")
      .feeHQT(Fee.ORDER_PLACEMENT_FEE)
    return new Transaction(this, "0", builder)
  }
}
