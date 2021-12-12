import { SubscriberTopic } from "./subscriber-topic";
import Subscription from "./subscription";
export declare class SubscriberBase {
    private url;
    private RETRY_SYNC_DELAY;
    private connectedSocketPromise;
    private subscribeTopics;
    private unsubscribeTopics;
    constructor(url: string);
    protected subscribe<T>(newTopic: SubscriberTopic<any>): Subscription<T>;
    private findExistingOrAddNewTopic;
    private createUnsubscribeFunction;
    private unsubscribeTopic;
    private syncTopicSubscriptions;
    private getConnectedSocket;
    private sendUnsubscribe;
    private sendSubscribe;
    private onMessageReceived;
    private topicMatchesDetails;
    private invokeOnMessageListeners;
    private invokeOnReconnectListeners;
    private invokeOnDisconnectListeners;
}
