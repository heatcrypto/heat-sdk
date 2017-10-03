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
import * as attachment from "./attachment"

export abstract class TransactionType {
  public static TYPE_PAYMENT = 0
  public static TYPE_MESSAGING = 1
  public static TYPE_COLORED_COINS = 2
  public static TYPE_ACCOUNT_CONTROL = 4
  public static SUBTYPE_PAYMENT_ORDINARY_PAYMENT = 0
  public static SUBTYPE_MESSAGING_ARBITRARY_MESSAGE = 0
  public static SUBTYPE_COLORED_COINS_ASSET_ISSUANCE = 0
  public static SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE = 1
  public static SUBTYPE_COLORED_COINS_ASSET_TRANSFER = 2
  public static SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT = 3
  public static SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT = 4
  public static SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION = 5
  public static SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION = 6
  public static SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_ADDITION = 7
  public static SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL = 8
  public static SUBTYPE_COLORED_COINS_WHITELIST_MARKET = 9
  public static SUBTYPE_ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING = 0

  abstract getType(): number
  abstract getSubtype(): number
  abstract parseAttachment(buffer: ByteBuffer): attachment.Attachment
  abstract canHaveRecipient(): boolean
  abstract getFee(): string

  public static findTransactionType(type: number, subtype: number) {
    if (type == this.TYPE_PAYMENT) {
      if (subtype == this.SUBTYPE_PAYMENT_ORDINARY_PAYMENT) {
        return ORDINARY_PAYMENT_TRANSACTION_TYPE
      }
    } else if (type == this.TYPE_MESSAGING) {
      if (subtype == this.SUBTYPE_MESSAGING_ARBITRARY_MESSAGE) {
        return ARBITRARY_MESSAGE_TRANSACTION_TYPE
      }
    }
  }

  mustHaveRecipient(): boolean {
    return this.canHaveRecipient()
  }
}

export class OrdinaryPayment extends TransactionType {
  getFee() {
    return attachment.ORDINARY_PAYMENT.getFee()
  }
  getType() {
    return TransactionType.TYPE_PAYMENT
  }
  getSubtype() {
    return TransactionType.SUBTYPE_PAYMENT_ORDINARY_PAYMENT
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.ORDINARY_PAYMENT
  }
  canHaveRecipient() {
    return true
  }
}

export class ArbitraryMessage extends TransactionType {
  getFee() {
    return attachment.ARBITRARY_MESSAGE.getFee()
  }
  getType() {
    return TransactionType.TYPE_MESSAGING
  }
  getSubtype() {
    return TransactionType.SUBTYPE_MESSAGING_ARBITRARY_MESSAGE
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.ARBITRARY_MESSAGE
  }
  canHaveRecipient() {
    return true
  }
  mustHaveRecipient(): boolean {
    return false
  }
}

abstract class ColoredCoins extends TransactionType {
  getType() {
    return TransactionType.TYPE_COLORED_COINS
  }
}

export class AssetIssuance extends ColoredCoins {
  getFee() {
    return attachment.COLORED_COINS_ASSET_ISSUANCE.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_ASSET_ISSUANCE
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_ASSET_ISSUANCE //???
  }
  canHaveRecipient() {
    return false
  }
}

export class AssetIssueMore extends ColoredCoins {
  getFee() {
    return attachment.COLORED_COINS_ASSET_ISSUE_MORE.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_ASSET_ISSUE_MORE //???
  }
  canHaveRecipient() {
    return false
  }
}

export class AssetTransfer extends ColoredCoins {
  getFee() {
    return attachment.COLORED_COINS_ASSET_TRANSFER.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_ASSET_TRANSFER
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_ASSET_TRANSFER //???
  }
  canHaveRecipient() {
    return true
  }
}

abstract class ColoredCoinsOrderPlacement extends ColoredCoins {
  canHaveRecipient(): boolean {
    return false
  }
}

export class AskOrderPlacement extends ColoredCoinsOrderPlacement {
  getFee() {
    return attachment.COLORED_COINS_ASK_ORDER_PLACEMENT.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_ASK_ORDER_PLACEMENT //???
  }
}

export class BidOrderPlacement extends ColoredCoinsOrderPlacement {
  getFee() {
    return attachment.COLORED_COINS_BID_ORDER_PLACEMENT.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_BID_ORDER_PLACEMENT //???
  }
}

abstract class ColoredCoinsOrderCancellation extends ColoredCoins {
  canHaveRecipient(): boolean {
    return false
  }
}

export class AskOrderCancellation extends ColoredCoinsOrderCancellation {
  getFee() {
    return attachment.COLORED_COINS_ASK_ORDER_CANCELLATION.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_ASK_ORDER_CANCELLATION //???
  }
}

export class BidOrderCancellation extends ColoredCoinsOrderCancellation {
  getFee() {
    return attachment.COLORED_COINS_BID_ORDER_CANCELLATION.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_BID_ORDER_CANCELLATION //???
  }
}

abstract class ColoredCoinsWhitelist extends ColoredCoins {
  canHaveRecipient(): boolean {
    return false
  }
}

export class WhitelistAccountAddition extends ColoredCoinsWhitelist {
  getFee() {
    return attachment.COLORED_COINS_WHITELIST_ACCOUNT_ADDITION.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_ADDITION
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_WHITELIST_ACCOUNT_ADDITION //???
  }
}

export class WhitelistAccountRemoval extends ColoredCoinsWhitelist {
  getFee() {
    return attachment.COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL //???
  }
}

export class WhitelistMarket extends ColoredCoinsWhitelist {
  getFee() {
    return attachment.COLORED_COINS_WHITELIST_MARKET.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_COLORED_COINS_WHITELIST_MARKET
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.COLORED_COINS_WHITELIST_MARKET //???
  }
}

abstract class AccountControl extends TransactionType {
  getType(): number {
    return TransactionType.TYPE_ACCOUNT_CONTROL
  }
  canHaveRecipient(): boolean {
    return true
  }
}

export class EffectiveBalanceLeasing extends AccountControl {
  getFee() {
    return attachment.ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING.getFee()
  }
  getSubtype() {
    return TransactionType.SUBTYPE_ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING
  }
  parseAttachment(buffer: ByteBuffer) {
    return attachment.ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING //???
  }
}

export let ORDINARY_PAYMENT_TRANSACTION_TYPE = new OrdinaryPayment()
export let ARBITRARY_MESSAGE_TRANSACTION_TYPE = new ArbitraryMessage()
export let COLORED_COINS_ASSET_ISSUANCE_TRANSACTION_TYPE = new AssetIssuance()
export let COLORED_COINS_ASSET_ISSUE_MORE_TRANSACTION_TYPE = new AssetIssueMore()
export let COLORED_COINS_ASSET_TRANSFER_TRANSACTION_TYPE = new AssetTransfer()
export let COLORED_COINS_ASK_ORDER_PLACEMENT_TRANSACTION_TYPE = new AskOrderPlacement()
export let COLORED_COINS_BID_ORDER_PLACEMENT_TRANSACTION_TYPE = new BidOrderPlacement()
export let ASK_ORDER_CANCELLATION = new AskOrderCancellation()
export let BID_ORDER_CANCELLATION = new BidOrderCancellation()
export let WHITELIST_ACCOUNT_ADDITION = new WhitelistAccountAddition()
export let WHITELIST_ACCOUNT_REMOVAL = new WhitelistAccountRemoval()
export let WHITELIST_MARKET = new WhitelistMarket()
export let EFFECTIVE_BALANCE_LEASING = new EffectiveBalanceLeasing()
