export default class Subscription<T> {
    isReconnect: boolean;
    onMessageCallback: (message: T) => void;
    onDisconnectCallback: () => void;
    onReconnectCallback: () => void;
    private unsubscribeFn;
    setUnsubscribeFn(unsubscribeFn: () => void): void;
    onMessage(callback: (message: T) => void): this;
    onDisconnect(callback: () => void): this;
    onReconnect(callback: () => void): this;
    close(): void;
}
