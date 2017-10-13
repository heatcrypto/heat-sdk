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
import { Builder, TransactionImpl } from "./builder"
import { Transaction } from "./transaction"
import { HeatApi } from "./heat-api"
import { SecretGenerator } from "./secret-generator"

export interface ConfigArgs {
  isTestnet?: boolean
  baseURL?: string
  websocketURL?: string
}

export class Configuration {
  isTestnet = false
  baseURL: string
  websocketURL: string
  constructor(args?: ConfigArgs) {
    if (args) {
      if (utils.isDefined(args.isTestnet)) this.isTestnet = !!args.isTestnet
      if (utils.isDefined(args.baseURL)) this.baseURL = <string>args.baseURL
      if (utils.isDefined(args.websocketURL))
        this.websocketURL = <string>args.websocketURL
    }
    if (!utils.isDefined(this.baseURL))
      this.baseURL = this.isTestnet
        ? "https://alpha.heatledger.com:7734/api/v1"
        : "https://heatwallet.com:7734/api/v1"
    if (!utils.isDefined(this.websocketURL))
      this.websocketURL = this.isTestnet
        ? "wss://alpha.heatledger.com:7755/ws/"
        : "wss://heatwallet.com:7755/ws/"
  }
}

export class HeatSDK {
  public api: HeatApi
  public utils = utils
  public crypto = crypto
  public config: Configuration
  public secretGenerator = new SecretGenerator()

  constructor(config?: Configuration) {
    const config_ = config ? config : new Configuration()
    this.config = config_
    this.api = new HeatApi({ baseURL: this.config.baseURL })
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
}
