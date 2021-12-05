/**
 * @returns Seconds since epoch.
 */
export function getSecondsSinceEpoch(): number {
    return Math.floor(Date.now() / 1000);
}
