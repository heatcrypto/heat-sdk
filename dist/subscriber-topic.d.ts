import Subscription from "./subscription";
export declare class SubscriberTopic<T> {
    topicId: string;
    params: any;
    subscriptions: Array<Subscription<T>>;
    private subscribed;
    constructor(topicId: string, params: any);
    setSubscribed(subscribed: boolean): void;
    isSubscribed(): boolean;
    add(subscription: Subscription<T>): void;
    remove(subscription: Subscription<T>): void;
    isEmpty(): boolean;
    equals(other: SubscriberTopic<T>): boolean;
    private objectEquals;
}
