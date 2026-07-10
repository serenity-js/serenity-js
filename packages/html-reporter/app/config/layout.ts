/**
 * Pixel heights for virtualised list rows.
 *
 * These values MUST match the rendered height produced by the CSS.
 * If you change row padding/font-size in styles.css, update these values.
 */
export const ROW_HEIGHTS = {
    /** Standard scenario row (name, tags, duration, source) */
    scenario: 108,
    /** Consistency view row (shorter — no source path) */
    consistency: 88,
    /** Error view row (same as scenario) */
    error: 108,
} as const;

/**
 * Group header heights for virtualised lists with sticky category headers.
 */
export const GROUP_HEADER_HEIGHTS = {
    /** First header (no top margin) */
    first: 62,
    /** Subsequent headers (with top separator) */
    rest: 78,
    /** Content area within the header (text only) */
    content: 46,
} as const;
