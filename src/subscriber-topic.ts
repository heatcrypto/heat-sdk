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
import * as utils from "./utils"
import Subscription from "./subscription"

export class SubscriberTopic<T> {
  public subscriptions: Array<Subscription<T>> = []
  private subscribed: boolean = false

  constructor(public topicId: string, public params: any) {
    if (!utils.isString(topicId)) throw new Error("Topic must be a string")
    if (!utils.isObject(params)) throw new Error("Params must be an object")
    var names = Object.getOwnPropertyNames(params)
    names.forEach(key => {
      if (!utils.isString(params[key]))
        throw new Error(`Params property ${key} is not a string`)
    })
  }

  public setSubscribed(subscribed: boolean) {
    this.subscribed = subscribed
  }

  public isSubscribed(): boolean {
    return this.subscribed
  }

  public add(subscription: Subscription<T>) {
    if (this.subscriptions.find(sub => sub === subscription))
      throw new Error("Duplicate subscription")
    this.subscriptions.push(subscription)
  }

  public remove(subscription: Subscription<T>) {
    this.subscriptions = this.subscriptions.filter(sub => sub !== subscription)
  }

  public isEmpty(): boolean {
    return this.subscriptions.length == 0
  }

  public equals(other: SubscriberTopic<T>): boolean {
    if (this.topicId != other.topicId) return false
    return this.objectEquals(this.params, other.params)
  }

  private objectEquals(
    a: { [key: string]: any },
    b: { [key: string]: any }
  ): boolean {
    let namesA = Object.getOwnPropertyNames(a)
    let namesB = Object.getOwnPropertyNames(b)
    if (namesA.length != namesB.length) return false
    for (var i = 0; i < namesA.length; i++) {
      let key = namesA[i]
      if (a[key] != b[key]) return false
    }
    return true
  }
}
