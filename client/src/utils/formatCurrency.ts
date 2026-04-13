/**
 * Formats a number as a LKR currency string with thousand separators.
 * e.g. 1500000 → "LKR 1,500,000"
 */
export const formatLKR = (value: number | string | undefined | null): string => {
    const num = Number(value);
    if (isNaN(num)) return 'LKR 0';
    return `LKR ${num.toLocaleString('en-US')}`;
};

/**
 * Formats a number with thousand separators only (no currency prefix).
 * e.g. 1500000 → "1,500,000"
 */
export const formatNumber = (value: number | string | undefined | null): string => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US');
};
