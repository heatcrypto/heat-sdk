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
import {
  Attachment,
  ORDINARY_PAYMENT,
  ARBITRARY_MESSAGE,
  Message,
  Payment
} from "./attachment"

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
  abstract parseAttachment(buffer: ByteBuffer): Attachment
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
}

export class OrdinaryPayment extends TransactionType {
  getFee() {
    return ORDINARY_PAYMENT.getFee()
  }
  getType() {
    return TransactionType.TYPE_PAYMENT
  }
  getSubtype() {
    return TransactionType.SUBTYPE_PAYMENT_ORDINARY_PAYMENT
  }
  parseAttachment(buffer: ByteBuffer) {
    return ORDINARY_PAYMENT
  }
  canHaveRecipient() {
    return true
  }
}

export class ArbitraryMessage extends TransactionType {
  getFee() {
    return ARBITRARY_MESSAGE.getFee()
  }
  getType() {
    return TransactionType.TYPE_MESSAGING
  }
  getSubtype() {
    return TransactionType.SUBTYPE_MESSAGING_ARBITRARY_MESSAGE
  }
  parseAttachment(buffer: ByteBuffer) {
    return ARBITRARY_MESSAGE
  }
  canHaveRecipient() {
    return true
  }
}

export var ORDINARY_PAYMENT_TRANSACTION_TYPE = new OrdinaryPayment()
export var ARBITRARY_MESSAGE_TRANSACTION_TYPE = new ArbitraryMessage()
