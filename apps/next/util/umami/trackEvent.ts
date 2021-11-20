
/**
 * To track events with Umami, add a class in the following format: `umami--<event>--<event-name>`
 * to the element.
 *
 * Ex: `umami--click--billing-interval-button`
 * See: https://umami.is/docs/track-events
 *
 * @param type Type of event
 * @param name Name of event
 * @returns Class to add to element
 */
export function trackEvent(type: keyof GlobalEventHandlersEventMap, name: string) {
    return `umami--${type}--${name}`;
}
