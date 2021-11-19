/**
 * https://dev.twitch.tv/docs/eventsub/manage-subscriptions#getting-the-list-of-events-you-subscribe-to
 */
export interface GetSubscriptionsResponse {
    /**
     * An array of subscription objects. The list is empty if you don’t have any subscriptions.
     */
    data: Subscription[];
    /**
     * The total number of subscriptions you’ve created.
     */
    total: number;
    /**
     * The sum of all of your subscription costs. [Learn More](https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#subscription-limits)
     */
    total_cost: number;
    /**
     * 	The maximum total cost that you’re allowed to incur for all subscriptions you create.
     */
    max_total_cost: number;
    /**
     * An object that contains the cursor used to get the next page of subscriptions.
     * The object is empty if the list of subscriptions fits on one page or there are no more pages to get.
     * The number of subscriptions returned per page is undertermined.
     */
    pagination: {
        /**
         * 	The cursor value that you set the after query parameter to.
         */
        cursor?: string;
    };
}

export enum TwitchSubscriptionStatus {
    /**
     * The subscription is enabled.
     */
    Enabled = "enabled",
    /**
     * The subscription is pending verification of the specified callback URL.
     */
    Pending = "webhook_callback_verification_pending",
    /**
     * The specified callback URL failed verification.
     */
    VerificationFailed = "webhook_callback_verification_failed",
    /**
     * The notification delivery failure rate was too high.
     */
    FailuresExceeded = "notification_failures_exceeded",
    /**
     * The authorization was revoked for one or more users specified in the Condition object.
     */
    AuthorizationRevoked = "authorization_revoked",
    /**
     * One of the users specified in the Condition object was removed.
     */
    UserRemoved = "user_removed"
}

/**
 * Twitch EventSub subscription
 *
 * https://dev.twitch.tv/docs/api/reference#get-eventsub-subscriptions
 */
export interface Subscription {
    /**
     * An ID that identifies the subscription.
     */
    id: string;
    /**
     * The subscription’s status.
     */
    status: TwitchSubscriptionStatus;
    /**
     * The subscription’s type.
     */
    type: string;
    /**
     * 	The version of the subscription type.
     */
    version: string;
    /**
     * 	The subscription’s parameter values.
     */
    condition: Condition;
    /**
     * The [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp indicating when the subscription was created.
     */
    created_at: string;
    /**
     * The transport details used to send you notifications.
     */
    transport: Transport;
    /**
    * The amount that the subscription counts against your limit.
    * [Learn More](https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#subscription-limits)
    */
    cost: number;
}

export interface Transport {
    method: 'webhook';
    callback: string;
}

export interface Condition {
    broadcaster_user_id?: string;
    user_id?: string;
}
