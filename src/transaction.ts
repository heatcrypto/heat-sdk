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
import { Builder, TransactionImpl } from "./builder"
import * as utils from "./utils"
import * as appendix from "./appendix"
import * as converters from "./converters"
import * as crypto from "./crypto"
import { HeatSDK } from "./heat-sdk"

export interface IBroadcastOutput {
  /**
   * The full hash of the signed transaction ,
   */
  fullHash: string
  /**
   * The transaction ID
   */
  transaction: string
}

export class Transaction {
  private publicMessage_: string
  private privateMessage_: string
  private privateMessageToSelf_: string
  private messageIsBinary_: boolean
  private deadline_: number
  private transaction_: TransactionImpl

  constructor(
    private heatsdk: HeatSDK,
    private recipientOrRecipientPublicKey: string,
    private builder: Builder
  ) {}

  public sign(secretPhrase: string): Promise<Transaction> {
    return this.build(secretPhrase).then(() => {
      this.transaction_ = this.builder.build(secretPhrase)
      return this
    })
  }

  public broadcast<T>(): Promise<T> {
    if (!utils.isDefined(this.transaction_))
      throw new Error("Must call sign() first")
    return this.heatsdk.api.post("/tx/broadcast", {
      transactionBytes: this.transaction_.getBytesAsHex()
    })
  }

  /**
   * Return signed transaction
   */
  public getTransaction() {
    if (!utils.isDefined(this.transaction_))
      throw new Error("Must call sign() first")
    return this.transaction_
  }

  private build(secretPhrase: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.builder
        .deadline(utils.isDefined(this.deadline_) ? this.deadline_ : 1440)
        .timestamp(utils.epochTime())
        .ecBlockHeight(1)
        .ecBlockId("0")

      let recipientPublicKeyHex
      if (utils.isDefined(this.privateMessageToSelf_))
        recipientPublicKeyHex = crypto.secretPhraseToPublicKey(secretPhrase)

      if (!recipientPublicKeyHex)
        recipientPublicKeyHex = utils.isPublicKey(
          this.recipientOrRecipientPublicKey
        )
          ? this.recipientOrRecipientPublicKey
          : null

      if (recipientPublicKeyHex) {
        this.builder
          .publicKeyAnnouncement(
            new appendix.AppendixPublicKeyAnnouncement().init(
              converters.hexStringToByteArray(recipientPublicKeyHex)
            )
          )
          .recipientId(crypto.getAccountIdFromPublicKey(recipientPublicKeyHex))
      } else {
        this.builder.recipientId(this.recipientOrRecipientPublicKey)
      }

      if (utils.isDefined(this.publicMessage_)) {
        let a = new appendix.AppendixMessage().init(
          this.messageIsBinary_
            ? converters.hexStringToByteArray(this.publicMessage_)
            : converters.stringToByteArray(this.publicMessage_),
          !this.messageIsBinary_
        )
        this.builder.message(a)
      } else {
        let isPrivate = utils.isDefined(this.privateMessage_)
        let isPrivateToSelf = utils.isDefined(this.privateMessageToSelf_)
        if (isPrivate || isPrivateToSelf) {
          if (!recipientPublicKeyHex)
            throw new Error("Recipient public key not provided")
          crypto
            .encryptMessage(
              isPrivate ? this.privateMessage_ : this.privateMessageToSelf_,
              recipientPublicKeyHex,
              secretPhrase
            )
            .then(encryptedMessage => {
              let a = (isPrivate
                ? new appendix.AppendixEncryptedMessage()
                : new appendix.AppendixEncryptToSelfMessage()
              ).init(encryptedMessage, !this.messageIsBinary_)
              this.builder.encryptToSelfMessage(a)
              resolve() // resolve in encryptMessage callback
            })
            .catch(reject)
          return // exit here to not touch the final resolve
        }
      }
      resolve()
    })
  }

  private hasMessage() {
    return (
      utils.isDefined(this.publicMessage_) ||
      utils.isDefined(this.privateMessage_) ||
      utils.isDefined(this.privateMessageToSelf_)
    )
  }

  public publicMessage(message: string, isBinary?: boolean) {
    if (this.hasMessage()) throw new Error("Transaction already has a message")
    this.messageIsBinary_ = !!isBinary
    this.publicMessage_ = message
    return this
  }

  public privateMessage(message: string, isBinary?: boolean) {
    if (this.hasMessage()) throw new Error("Transaction already has a message")
    this.messageIsBinary_ = !!isBinary
    this.privateMessage_ = message
    return this
  }

  public privateMessageToSelf(message: string, isBinary?: boolean) {
    if (this.hasMessage()) throw new Error("Transaction already has a message")
    this.messageIsBinary_ = !!isBinary
    this.privateMessageToSelf_ = message
    return this
  }

  public deadline(deadline: number) {
    this.deadline_ = deadline
    return this
  }
}
