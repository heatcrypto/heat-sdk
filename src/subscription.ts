export default class Subscription<T> {
  public isReconnect = false
  public onMessageCallback: (message: T) => void
  public onDisconnectCallback: () => void
  public onReconnectCallback: () => void
  private unsubscribeFn: () => void

  setUnsubscribeFn(unsubscribeFn: () => void) {
    this.unsubscribeFn = unsubscribeFn
  }

  onMessage(callback: (message: T) => void) {
    this.onMessageCallback = callback
    return this
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback
    return this
  }

  onReconnect(callback: () => void) {
    this.onReconnectCallback = callback
    return this
  }

  close() {
    if (!this.unsubscribeFn) throw new Error("Subscription already closed")
    this.unsubscribeFn()
    this.unsubscribeFn = null
  }
}
