/// <reference path='bytebuffer.d.ts' />
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
import * as appendix from "./appendix"
import * as transactionType from "./transaction-type"
import { byteArrayToHexString, stringToByteArray } from "./converters"
import { Fee } from "./fee"

export interface Attachment extends appendix.Appendix {
  getTransactionType(): transactionType.TransactionType
}

export abstract class EmptyAttachment extends appendix.AbstractAppendix
  implements Attachment {
  protected version: number = 0

  public parse(buffer: ByteBuffer) {}

  public getSize(): number {
    return this.getMySize()
  }

  public putBytes(buffer: ByteBuffer) {
    this.putMyBytes(buffer)
  }

  putMyBytes(buffer: ByteBuffer) {}
  putMyJSON(json: { [key: string]: any }) {}
  getMySize() {
    return 0
  }
  abstract getTransactionType(): transactionType.TransactionType
  abstract getFee(): string
}

export class Payment extends EmptyAttachment {
  getFee() {
    return Fee.DEFAULT
  }
  getAppendixName() {
    return "OrdinaryPayment"
  }
  getTransactionType() {
    return transactionType.ORDINARY_PAYMENT_TRANSACTION_TYPE
  }
}

export class Message extends EmptyAttachment {
  getFee() {
    return Fee.DEFAULT
  }
  getAppendixName() {
    return "ArbitraryMessage"
  }
  getTransactionType() {
    return transactionType.ARBITRARY_MESSAGE_TRANSACTION_TYPE
  }
}

// ------------------- Asset ------------------------------------------------------------------------------------------

export class AssetIssuance extends appendix.AbstractAppendix
  implements Attachment {
  private _descriptionUrl: string
  private _descriptionHash: Uint8Array //todo is Uint8Array correct type here?
  private _quantity: number
  private _decimals: number
  private _dillutable: boolean

  getMySize(): number {
    return 1 + stringToByteArray(this._descriptionUrl).length + 32 + 8 + 1 + 1
  }

  putMyBytes(buffer: ByteBuffer): void {
    let descriptionUrl = stringToByteArray(this._descriptionUrl)
    buffer.writeByte(descriptionUrl.length)
    buffer.append(this._descriptionUrl)
    buffer.append(this._descriptionHash)
    buffer.writeInt64(this._quantity)
    buffer.writeByte(this._decimals)
    buffer.writeByte(this._dillutable ? 1 : 0)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["descriptionUrl"] = this._descriptionUrl
    json["descriptionHash"] = Buffer.from(
      this._descriptionHash.buffer
    ).toString("hex")
    json["quantity"] = this._quantity
    json["decimals"] = this._decimals
    json["dillutable"] = this._dillutable
  }

  getFee() {
    return Fee.ASSET_ISSUANCE_FEE
  }

  getAppendixName() {
    return "AssetIssuance"
  }

  getTransactionType() {
    return transactionType.COLORED_COINS_ASSET_ISSUANCE_TRANSACTION_TYPE
  }

  get descriptionUrl(): string {
    return this._descriptionUrl
  }

  get descriptionHash(): Uint8Array {
    return this._descriptionHash
  }

  get quantity(): number {
    return this._quantity
  }

  get decimals(): number {
    return this._decimals
  }

  get dillutable(): boolean {
    return this._dillutable
  }
}

abstract class AssetBase extends appendix.AbstractAppendix {
  private _assetId: number
  private _quantity: number

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._quantity)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId >>> 0 //todo is it right convert to unsigned?
    json["quantity"] = this._quantity
  }

  get assetId(): number {
    return this._assetId
  }

  get quantity(): number {
    return this._quantity
  }
}

export class AssetIssueMore extends AssetBase implements Attachment {
  getFee() {
    return Fee.ASSET_ISSUE_MORE_FEE
  }

  getAppendixName() {
    return "AssetIssueMore"
  }

  getTransactionType() {
    return transactionType.COLORED_COINS_ASSET_ISSUE_MORE_TRANSACTION_TYPE
  }
}

export class AssetTransfer extends AssetBase implements Attachment {
  getFee() {
    return Fee.ASSET_TRANSFER_FEE
  }

  getAppendixName() {
    return "AssetTransfer"
  }

  getTransactionType() {
    return transactionType.COLORED_COINS_ASSET_TRANSFER_TRANSACTION_TYPE
  }
}

// ------------------- Colored coins. Orders ----------------------------------------------------------------------------

abstract class ColoredCoinsOrderPlacement extends appendix.AbstractAppendix {
  private _currencyId: number
  private _assetId: number
  private _quantity: number
  private _price: number
  private _expiration: number

  getMySize(): number {
    return 8 + 8 + 8 + 8 + 4
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._currencyId)
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._quantity)
    buffer.writeInt64(this._price)
    buffer.writeInt32(this._expiration)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["currency"] = this._currencyId >>> 0 //todo is it right convert to unsigned?
    json["asset"] = this._assetId >>> 0 //todo is it right convert to unsigned?
    json["quantity"] = this._quantity
    json["price"] = this._price
    json["expiration"] = this._expiration
  }

  getFee() {
    return Fee.ORDER_PLACEMENT_FEE
  }

  get currencyId(): number {
    return this._currencyId
  }

  get assetId(): number {
    return this._assetId
  }

  get quantity(): number {
    return this._quantity
  }

  get price(): number {
    return this._price
  }

  get expiration(): number {
    return this._expiration
  }
}

export class ColoredCoinsAskOrderPlacement extends ColoredCoinsOrderPlacement
  implements Attachment {
  getAppendixName() {
    return "AskOrderPlacement"
  }

  getTransactionType() {
    return transactionType.COLORED_COINS_ASK_ORDER_PLACEMENT_TRANSACTION_TYPE
  }
}

export class ColoredCoinsBidOrderPlacement extends ColoredCoinsOrderPlacement
  implements Attachment {
  getAppendixName() {
    return "BidOrderPlacement"
  }

  getTransactionType() {
    return transactionType.COLORED_COINS_BID_ORDER_PLACEMENT_TRANSACTION_TYPE
  }
}

abstract class ColoredCoinsOrderCancellation extends appendix.AbstractAppendix {
  private _orderId: number

  getMySize(): number {
    return 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._orderId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["order"] = this._orderId >>> 0 //todo is it right convert to unsigned?
  }

  getFee() {
    return Fee.ORDER_CANCELLATION_FEE
  }

  get orderId(): number {
    return this._orderId
  }
}

export class ColoredCoinsAskOrderCancellation extends ColoredCoinsOrderCancellation
  implements Attachment {
  getAppendixName() {
    return "AskOrderCancellation"
  }

  getTransactionType() {
    return transactionType.ASK_ORDER_CANCELLATION
  }
}

export class ColoredCoinsBidOrderCancellation extends ColoredCoinsOrderCancellation
  implements Attachment {
  getAppendixName() {
    return "BidOrderCancellation"
  }

  getTransactionType() {
    return transactionType.BID_ORDER_CANCELLATION
  }
}

// ------------------- Colored coins. Whitelist ------------------------------------------------------------------------

export class ColoredCoinsWhitelistAccountAddition extends appendix.AbstractAppendix
  implements Attachment {
  private _assetId: number
  private _accountId: number
  private _endHeight: number

  getMySize(): number {
    return 8 + 8 + 4
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._accountId)
    buffer.writeInt32(this._endHeight)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId >>> 0 //todo is it right convert to unsigned?
    json["account"] = this._accountId >>> 0 //todo is it right convert to unsigned?
    json["endHeight"] = this._endHeight
  }

  getAppendixName() {
    return "WhitelistAccountAddition"
  }

  getTransactionType() {
    return transactionType.WHITELIST_ACCOUNT_ADDITION
  }

  getFee() {
    return Fee.WHITELIST_ACCOUNT_FEE
  }

  get assetId(): number {
    return this._assetId
  }

  get accountId(): number {
    return this._accountId
  }

  get endHeight(): number {
    return this._endHeight
  }
}

export class ColoredCoinsWhitelistAccountRemoval extends appendix.AbstractAppendix
  implements Attachment {
  private _assetId: number
  private _accountId: number

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._accountId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId >>> 0 //todo is it right convert to unsigned?
    json["account"] = this._accountId >>> 0 //todo is it right convert to unsigned?
  }

  getAppendixName() {
    return "WhitelistAccountRemoval"
  }

  getTransactionType() {
    return transactionType.WHITELIST_ACCOUNT_REMOVAL
  }

  getFee() {
    return Fee.WHITELIST_ACCOUNT_FEE
  }

  get assetId(): number {
    return this._assetId
  }

  get accountId(): number {
    return this._accountId
  }
}

export class ColoredCoinsWhitelistMarket extends appendix.AbstractAppendix
  implements Attachment {
  private _currencyId: number
  private _assetId: number

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._currencyId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId >>> 0 //todo is it right convert to unsigned?
    json["account"] = this._currencyId >>> 0 //todo is it right convert to unsigned?
  }

  getAppendixName() {
    return "WhitelistMarket"
  }

  getTransactionType() {
    return transactionType.WHITELIST_MARKET
  }

  getFee() {
    return Fee.WHITELIST_MARKET_FEE
  }

  get assetId(): number {
    return this._assetId
  }

  get currencyId(): number {
    return this._currencyId
  }
}

// ------------------- AccountControlEffectiveBalanceLeasing -----------------------------------------------------------

export class AccountControlEffectiveBalanceLeasing extends appendix.AbstractAppendix
  implements Attachment {
  private _period: number

  getMySize(): number {
    return 4
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt32(this._period)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["period"] = this._period
  }

  getAppendixName() {
    return "EffectiveBalanceLeasing"
  }

  getTransactionType() {
    return transactionType.EFFECTIVE_BALANCE_LEASING
  }

  getFee() {
    return Fee.EFFECTIVE_BALANCE_LEASING_FEE
  }

  get period(): number {
    return this._period
  }
}

export let ORDINARY_PAYMENT = new Payment()
export let ARBITRARY_MESSAGE = new Message()
export let COLORED_COINS_ASSET_ISSUANCE = new AssetIssuance()
export let COLORED_COINS_ASSET_ISSUE_MORE = new AssetIssueMore()
export let COLORED_COINS_ASSET_TRANSFER = new AssetTransfer()
export let COLORED_COINS_ASK_ORDER_PLACEMENT = new ColoredCoinsAskOrderPlacement()
export let COLORED_COINS_BID_ORDER_PLACEMENT = new ColoredCoinsBidOrderPlacement()
export let COLORED_COINS_ASK_ORDER_CANCELLATION = new ColoredCoinsAskOrderCancellation()
export let COLORED_COINS_BID_ORDER_CANCELLATION = new ColoredCoinsBidOrderCancellation()
export let COLORED_COINS_WHITELIST_ACCOUNT_ADDITION = new ColoredCoinsWhitelistAccountAddition()
export let COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL = new ColoredCoinsWhitelistAccountRemoval()
export let COLORED_COINS_WHITELIST_MARKET = new ColoredCoinsWhitelistMarket()
export let ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING = new AccountControlEffectiveBalanceLeasing()
