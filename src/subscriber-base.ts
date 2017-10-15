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

import { SubscriberTopic } from "./subscriber-topic"
import Subscription from "./subscription"
import * as utils from "./utils"
const WebSocket = <any>require("isomorphic-ws")

export class SubscriberBase {
  private RETRY_SYNC_DELAY = 2.5 * 1000 // 2.5 seconds in milliseconds

  private connectedSocketPromise: Promise<any> = null
  private subscribeTopics: Array<SubscriberTopic<any>> = []
  private unsubscribeTopics: Array<SubscriberTopic<any>> = []

  constructor(private url: string) {}

  protected subscribe<T>(newTopic: SubscriberTopic<any>): Subscription<T> {
    var topic = this.findExistingOrAddNewTopic(newTopic)
    var subscription = new Subscription<T>()
    topic.add(subscription)
    var unsubscribe = this.createUnsubscribeFunction(topic, subscription)
    subscription.setUnsubscribeFn(unsubscribe)
    this.syncTopicSubscriptions()
    return subscription
  }

  private findExistingOrAddNewTopic(
    topic: SubscriberTopic<any>
  ): SubscriberTopic<any> {
    for (var i = 0; i < this.subscribeTopics.length; i++) {
      if (this.subscribeTopics[i].equals(topic)) {
        return this.subscribeTopics[i]
      }
    }
    this.subscribeTopics.push(topic)
    return topic
  }

  private createUnsubscribeFunction(
    topic: SubscriberTopic<any>,
    subscription: Subscription<any>
  ): () => void {
    return () => {
      topic.remove(subscription)
      if (topic.isEmpty()) {
        this.unsubscribeTopic(topic)
      }
    }
  }

  private unsubscribeTopic(topic: SubscriberTopic<any>) {
    this.subscribeTopics = this.subscribeTopics.filter(t => t !== topic)
    this.unsubscribeTopics.push(topic)
    this.syncTopicSubscriptions()
  }

  private syncTopicSubscriptions() {
    this.getConnectedSocket()
      .then((websocket: WebSocket) => {
        this.unsubscribeTopics.forEach(topic => {
          if (topic.isSubscribed()) {
            this.sendUnsubscribe(websocket, topic)
          }
        })
        this.unsubscribeTopics = this.unsubscribeTopics.filter(
          topic => !topic.isSubscribed()
        )
        this.subscribeTopics.forEach(topic => {
          if (!topic.isSubscribed()) {
            this.sendSubscribe(websocket, topic)
          }
        })
        // if there is a topic which is not subscribed we need to sync again
        if (this.subscribeTopics.find(topic => !topic.isSubscribed())) {
          setTimeout(() => {
            this.syncTopicSubscriptions()
          }, this.RETRY_SYNC_DELAY)
        }
      })
      .catch(() => {
        // on failure call syncTopicSubscriptions again
        setTimeout(() => {
          this.syncTopicSubscriptions()
        }, this.RETRY_SYNC_DELAY)
      })
  }

  private getConnectedSocket() {
    if (this.connectedSocketPromise) {
      return this.connectedSocketPromise
    }
    this.connectedSocketPromise = new Promise((resolve, reject) => {
      var websocket = new WebSocket(this.url, undefined, undefined)
      var onclose = (event: any) => {
        reject(event)
        this.connectedSocketPromise = null
        websocket.onclose = null
        websocket.onopen = null
        websocket.onerror = null
        websocket.onmessage = null
        this.subscribeTopics.forEach(topic => {
          topic.setSubscribed(false)
          this.invokeOnDisconnectListeners(topic)
        })
        this.syncTopicSubscriptions()
      }
      var onerror = onclose
      var onopen = (event: any) => {
        resolve(websocket)
        this.subscribeTopics.forEach(topic => {
          this.invokeOnReconnectListeners(topic)
        })
      }
      var onmessage = (event: any) => {
        try {
          this.onMessageReceived(JSON.parse(event.data))
        } catch (e) {
          console.log("Websocket parse error", e)
        }
      }
      websocket.onclose = onclose
      websocket.onopen = onopen
      websocket.onerror = onerror
      websocket.onmessage = onmessage
    })
    return this.connectedSocketPromise
  }

  private sendUnsubscribe(websocket: WebSocket, topic: SubscriberTopic<any>) {
    if (websocket.readyState == 1) {
      websocket.send(
        JSON.stringify(["unsubscribe", [[topic.topicId, topic.params]]])
      )
      topic.setSubscribed(false)
    }
  }

  private sendSubscribe(websocket: WebSocket, topic: SubscriberTopic<any>) {
    if (websocket.readyState == 1) {
      websocket.send(
        JSON.stringify(["subscribe", [[topic.topicId, topic.params]]])
      )
      topic.setSubscribed(true)
    }
  }

  private onMessageReceived(messageJson: Object) {
    if (!Array.isArray(messageJson) || messageJson.length != 3) {
      console.log("Websocket invalid message", messageJson)
      return
    }
    var topicAsStr = messageJson[0],
      details = messageJson[1],
      contents = messageJson[2]
    if (!utils.isString(topicAsStr) || !utils.isObject(details)) {
      console.log("Websocket invalid field", messageJson)
      return
    }

    this.subscribeTopics.forEach(topic => {
      if (
        topic.topicId == topicAsStr &&
        this.topicMatchesDetails(topic, details)
      ) {
        this.invokeOnMessageListeners(topic, contents)
      }
    })
  }

  private topicMatchesDetails(
    topic: SubscriberTopic<any>,
    details: { [key: string]: any }
  ) {
    var filterKeys = Object.getOwnPropertyNames(topic.params)
    for (var i = 0, key = filterKeys[i]; i < filterKeys.length; i++) {
      if (topic.params[key] != details[key]) return false
    }
    return true
  }

  private invokeOnMessageListeners(
    topic: SubscriberTopic<any>,
    contents: Object
  ) {
    topic.subscriptions.forEach(subscription => {
      try {
        if (subscription.onMessageCallback)
          subscription.onMessageCallback(contents)
      } catch (e) {
        console.error(e)
      }
    })
  }

  private invokeOnReconnectListeners(topic: SubscriberTopic<any>) {
    topic.subscriptions.forEach(subscription => {
      try {
        if (subscription.isReconnect) {
          if (subscription.onReconnectCallback)
            subscription.onReconnectCallback()
        }
        subscription.isReconnect = true
      } catch (e) {
        console.error(e)
      }
    })
  }

  private invokeOnDisconnectListeners(topic: SubscriberTopic<any>) {
    topic.subscriptions.forEach(subscription => {
      try {
        if (subscription.onDisconnectCallback)
          subscription.onDisconnectCallback()
      } catch (e) {
        console.error(e)
      }
    })
  }
}
