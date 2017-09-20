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
import * as transactionType from "./transaction_type"

export interface Attachment extends appendix.Appendix {
  getTransactionType(): transactionType.TransactionType
}

export abstract class EmptyAttachment extends appendix.AbstractAppendix
  implements Attachment {
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
    return "1000000"
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
    return "1000000"
  }
  getAppendixName() {
    return "ArbitraryMessage"
  }
  getTransactionType() {
    return transactionType.ARBITRARY_MESSAGE_TRANSACTION_TYPE
  }
}

export var ORDINARY_PAYMENT = new Payment()
export var ARBITRARY_MESSAGE = new Message()
