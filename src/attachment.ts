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
import * as converters from "./converters"
import { Fee } from "./fee"
import ByteBuffer from "bytebuffer"
import Long from "long"

export interface Attachment extends appendix.Appendix {
  getTransactionType(): transactionType.TransactionType
}

export abstract class EmptyAttachment extends appendix.AbstractAppendix
  implements Attachment {
  constructor() {
    super()
    this.version = 0
  }

  public parse(buffer: ByteBuffer) {}

  public getSize(): number {
    return this.getMySize()
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
  private _descriptionHash: Int8Array
  private _quantity: Long
  private _decimals: number
  private _dillutable: boolean

  getMySize(): number {
    return (
      1 +
      converters.stringToByteArray(this._descriptionUrl).length +
      32 +
      8 +
      1 +
      1
    )
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this._descriptionUrl = buffer.readUTF8String(buffer.readByte()) //here do not need to check Constants.MAX_ASSET_DESCRIPTION_URL_LENGTH
    this._descriptionHash = new Int8Array(32)
    for (let i = 0; i < 32; i++) this._descriptionHash[i] = buffer.readByte()
    this._quantity = buffer.readInt64()
    this._decimals = buffer.readByte()
    this._dillutable = buffer.readByte() == 1
  }

  putMyBytes(buffer: ByteBuffer): void {
    let descriptionUrl = converters.stringToByteArray(this._descriptionUrl)
    buffer.writeByte(descriptionUrl.length)
    buffer.append(this._descriptionUrl)
    buffer.append(new Uint8Array(this._descriptionHash))
    buffer.writeInt64(this._quantity)
    buffer.writeByte(this._decimals)
    buffer.writeByte(this._dillutable ? 1 : 0)
  }

  public parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this._descriptionUrl = json["descriptionUrl"]
    this._descriptionHash = <any>converters.hexStringToByteArray(
      json["descriptionHash"]
    )
    this._quantity = Long.fromString(json["quantity"])
    this._decimals = json["decimals"]
    this._dillutable = json["dillutable"]
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["descriptionUrl"] = this._descriptionUrl
    json["descriptionHash"] = converters.byteArrayToHexString(
      Array.from(this._descriptionHash)
    )
    json["quantity"] = this._quantity.toString()
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

  getDescriptionUrl(): string {
    return this._descriptionUrl
  }

  getDescriptionHash(): Int8Array {
    return this._descriptionHash
  }

  getQuantity(): Long {
    return this._quantity
  }

  getDecimals(): number {
    return this._decimals
  }

  getDillutable(): boolean {
    return this._dillutable
  }
}

export abstract class AssetBase extends appendix.AbstractAppendix {
  private _assetId: Long
  private _quantity: Long

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._quantity)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId.toUnsigned().toString()
    json["quantity"] = this._quantity.toString()
  }

  parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this._assetId = Long.fromString(json["asset"], true)
    this._quantity = Long.fromString(json["quantity"])
  }

  getAssetId(): Long {
    return this._assetId
  }

  getQuantity(): Long {
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

export abstract class ColoredCoinsOrderPlacement extends appendix.AbstractAppendix {
  private _currencyId: Long
  private _assetId: Long
  private _quantity: Long
  private _price: Long
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

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this._currencyId = buffer.readInt64()
    this._assetId = buffer.readInt64()
    this._quantity = buffer.readInt64()
    this._price = buffer.readInt64()
    this._expiration = buffer.readInt32()
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["currency"] = this._currencyId.toUnsigned().toString()
    json["asset"] = this._assetId.toUnsigned().toString()
    json["quantity"] = this._quantity.toString()
    json["price"] = this._price.toString()
    json["expiration"] = this._expiration.toString()
  }

  parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this._currencyId = Long.fromString(json["currency"], true)
    this._assetId = Long.fromString(json["asset"], true)
    this._quantity = Long.fromString(json["quantity"])
    this._price = Long.fromString(json["price"])
    this._expiration = json["expiration"]
  }

  getFee() {
    return Fee.ORDER_PLACEMENT_FEE
  }

  getCurrencyId(): Long {
    return this._currencyId
  }

  getAssetId(): Long {
    return this._assetId
  }

  getQuantity(): Long {
    return this._quantity
  }

  getPrice(): Long {
    return this._price
  }

  getExpiration(): number {
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

export abstract class ColoredCoinsOrderCancellation extends appendix.AbstractAppendix {
  private _orderId: Long

  getMySize(): number {
    return 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._orderId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["order"] = this._orderId.toUnsigned().toString()
  }

  public parse(buffer: ByteBuffer) {
    super.parse(buffer)
    this._orderId = buffer.readInt64()
  }

  parseJSON(json: { [key: string]: any }) {
    super.parseJSON(json)
    this._orderId = Long.fromString(json["order"], true)
  }

  getFee() {
    return Fee.ORDER_CANCELLATION_FEE
  }

  getOrderId(): Long {
    return this._orderId
  }
}

export class ColoredCoinsAskOrderCancellation extends ColoredCoinsOrderCancellation
  implements Attachment {
  getAppendixName() {
    return "AskOrderCancellation"
  }

  getTransactionType() {
    return transactionType.ASK_ORDER_CANCELLATION_TRANSACTION_TYPE
  }
}

export class ColoredCoinsBidOrderCancellation extends ColoredCoinsOrderCancellation
  implements Attachment {
  getAppendixName() {
    return "BidOrderCancellation"
  }

  getTransactionType() {
    return transactionType.BID_ORDER_CANCELLATION_TRANSACTION_TYPE
  }
}

// ------------------- Colored coins. Whitelist ------------------------------------------------------------------------

export class ColoredCoinsWhitelistAccountAddition extends appendix.AbstractAppendix
  implements Attachment {
  private _assetId: Long
  private _accountId: Long
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
    json["asset"] = this._assetId.toUnsigned().toString()
    json["account"] = this._accountId.toUnsigned().toString()
    json["endHeight"] = this._endHeight
  }

  getAppendixName() {
    return "WhitelistAccountAddition"
  }

  getTransactionType() {
    return transactionType.WHITELIST_ACCOUNT_ADDITION_TRANSACTION_TYPE
  }

  getFee() {
    return Fee.WHITELIST_ACCOUNT_FEE
  }

  getAssetId(): Long {
    return this._assetId
  }

  getAccountId(): Long {
    return this._accountId
  }

  getEndHeight(): number {
    return this._endHeight
  }
}

export class ColoredCoinsWhitelistAccountRemoval extends appendix.AbstractAppendix
  implements Attachment {
  private _assetId: Long
  private _accountId: Long

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._accountId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId.toUnsigned().toString()
    json["account"] = this._accountId.toUnsigned().toString()
  }

  getAppendixName() {
    return "WhitelistAccountRemoval"
  }

  getTransactionType() {
    return transactionType.WHITELIST_ACCOUNT_REMOVAL_TRANSACTION_TYPE
  }

  getFee() {
    return Fee.WHITELIST_ACCOUNT_FEE
  }

  getAssetId(): Long {
    return this._assetId
  }

  getAccountId(): Long {
    return this._accountId
  }
}

export class ColoredCoinsWhitelistMarket extends appendix.AbstractAppendix
  implements Attachment {
  private _currencyId: Long
  private _assetId: Long

  getMySize(): number {
    return 8 + 8
  }

  putMyBytes(buffer: ByteBuffer): void {
    buffer.writeInt64(this._assetId)
    buffer.writeInt64(this._currencyId)
  }

  putMyJSON(json: { [key: string]: any }): void {
    json["asset"] = this._assetId.toUnsigned().toString()
    json["account"] = this._currencyId.toUnsigned().toString()
  }

  getAppendixName() {
    return "WhitelistMarket"
  }

  getTransactionType() {
    return transactionType.WHITELIST_MARKET_TRANSACTION_TYPE
  }

  getFee() {
    return Fee.WHITELIST_MARKET_FEE
  }

  getAssetId(): Long {
    return this._assetId
  }

  getCurrencyId(): Long {
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
    return transactionType.EFFECTIVE_BALANCE_LEASING_TRANSACTION_TYPE
  }

  getFee() {
    return Fee.EFFECTIVE_BALANCE_LEASING_FEE
  }

  getPeriod(): number {
    return this._period
  }
}

export let ORDINARY_PAYMENT = new Payment()
export let ARBITRARY_MESSAGE = new Message()
// export let COLORED_COINS_ASSET_ISSUANCE = new AssetIssuance()
// export let COLORED_COINS_ASSET_ISSUE_MORE = new AssetIssueMore()
// export let COLORED_COINS_ASSET_TRANSFER = new AssetTransfer()
// export let COLORED_COINS_ASK_ORDER_PLACEMENT = new ColoredCoinsAskOrderPlacement()
// export let COLORED_COINS_BID_ORDER_PLACEMENT = new ColoredCoinsBidOrderPlacement()
// export let COLORED_COINS_ASK_ORDER_CANCELLATION = new ColoredCoinsAskOrderCancellation()
// export let COLORED_COINS_BID_ORDER_CANCELLATION = new ColoredCoinsBidOrderCancellation()
// export let COLORED_COINS_WHITELIST_ACCOUNT_ADDITION = new ColoredCoinsWhitelistAccountAddition()
// export let COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL = new ColoredCoinsWhitelistAccountRemoval()
// export let COLORED_COINS_WHITELIST_MARKET = new ColoredCoinsWhitelistMarket()
// export let ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING = new AccountControlEffectiveBalanceLeasing()
