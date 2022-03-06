export const formatUsd = (amount: number, negate?: boolean) => {
    return `$${(amount / (100 * (negate ? -1 : 1))).toFixed(2)}`;
};
