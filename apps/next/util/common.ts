export const isSSR = () => typeof window === 'undefined';

export const timestampToDate = (t?: number | null) => {
    if (!t) {
        return null;
    }
    return new Date(t * 1000);
};

/**
 * @returns Seconds since epoch.
 */
export function getSecondsSinceEpoch(): number {
    return Math.floor(Date.now() / 1000);
}
