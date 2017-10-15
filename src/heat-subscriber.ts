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
import { SubscriberBase } from "./subscriber-base"
import { SubscriberTopic } from "./subscriber-topic"
import Subscription from "./subscription"

export class HeatSubscriber extends SubscriberBase {
  // websocket subscription topics - these match the topics in the java com.heatledger.websocket package
  private BLOCK_PUSHED = "1"
  private BLOCK_POPPED = "2"
  private BALANCE_CHANGED = "3"
  private ORDER = "4"
  private TRADE = "5"
  private MESSAGE = "6"
  private UNCONFIRMED_TRANSACTION = "7"
  private MICROSERVICE = "8"

  constructor(url: string) {
    super(url)
  }

  public blockPushed(filter: SubscriberBlockPushedFilter): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.BLOCK_PUSHED, filter))
  }

  public blockPopped(filter: SubscriberBlockPoppedFilter): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.BLOCK_POPPED, filter))
  }

  public balanceChanged(
    filter: SubscriberBalanceChangedFilter
  ): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.BALANCE_CHANGED, filter))
  }

  public order(filter: SubscriberOrderFilter): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.ORDER, filter))
  }

  public trade(filter: SubscriberTradeFilter): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.TRADE, filter))
  }

  public message(filter: SubscriberMessageFilter): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.MESSAGE, filter))
  }

  public unconfirmedTransaction(
    filter: SubscriberUnconfirmedTransactionFilter
  ): Subscription<any> {
    return this.subscribe(
      new SubscriberTopic(this.UNCONFIRMED_TRANSACTION, filter)
    )
  }

  public microservice(filter: { [key: string]: string }): Subscription<any> {
    return this.subscribe(new SubscriberTopic(this.MICROSERVICE, filter))
  }
}

export interface SubscriberBlockPushedFilter {
  generator?: string
}

export interface SubscriberBlockPoppedFilter {
  generator?: string
}

export interface SubscriberBalanceChangedFilter {
  account?: string
  currency?: string
}

export interface SubscriberBalanceChangedResponse {
  account: string
  currency: string
  quantity: string
}

export interface SubscriberOrderFilter {
  account?: string
  currency?: string
  asset?: string
  unconfirmed?: string // true or false
  type?: string // ask or bid
}

export interface SubscriberTradeFilter {
  seller?: string
  buyer?: string
  currency?: string
  asset?: string
}

export interface SubscriberMessageFilter {
  sender?: string
  recipient?: string
}

export interface SubscriberUnconfirmedTransactionFilter {
  sender?: string
  recipient?: string
}
