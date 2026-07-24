export function formatDuration(ms: number): string {
    if (ms === 0) return '—';
    ms = Math.round(ms * 10) / 10;  // avoid floating point artefacts
    if (ms < 1000) return ms + 'ms';
    if (ms < 60_000) return (ms / 1000).toFixed(1) + 's';
    const mins = Math.floor(ms / 60_000);
    const secs = Math.round((ms % 60_000) / 1000);
    if (ms < 3_600_000) return mins + 'm ' + secs + 's';
    const hours = Math.floor(ms / 3_600_000);
    const remainMins = Math.floor((ms % 3_600_000) / 60_000);
    return hours + 'h ' + remainMins + 'm';
}

export function outcomeClass(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: 'passed', FAILURE: 'failed', PENDING: 'pending', SKIPPED: 'skipped', COMPROMISED: 'compromised', ERROR: 'error', RETRIED_SUCCESS: 'retried-success' };
    return map[outcome] || 'skipped';
}

export function outcomeIcon(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: '✓', FAILURE: '✗', PENDING: '–', SKIPPED: '⊘', COMPROMISED: '⚠', ERROR: '!', RETRIED_SUCCESS: '↻' };
    return map[outcome] || '?';
}

/**
 * Maps an outcome string to a human-readable display name.
 * Note: outcome values are strings from data.js, not a compile-time union.
 * New outcomes (e.g. 'RETRIED_SUCCESS') must be added here manually.
 */
export function outcomeDisplayName(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: 'Passed', FAILURE: 'Failed', PENDING: 'Pending', SKIPPED: 'Skipped', COMPROMISED: 'Compromised', ERROR: 'Error', RETRIED_SUCCESS: 'Retried success' };
    return map[outcome] || outcome;
}

/**
 * Maps a percentage score (0–100) to a semantic colour variable.
 * Used for confidence, pass rate, consistency, and completeness displays.
 */
export function scoreColor(value: number): string | undefined {
    if (value >= 90) return 'var(--color-passed)';
    if (value < 50) return 'var(--color-failed)';
    if (value < 70) return 'var(--color-pending)';
    return undefined;
}

export function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function formatRunLabel(label: string, timestamp: string): string {
    return /^\d{4}-\d{2}-\d{2}T/.test(label) ? formatTimestamp(timestamp) : label + ' — ' + formatTimestamp(timestamp);
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function looksLikeBuildNumber(label: string): boolean {
    return label.length <= 10 && !/^\d{4}-\d{2}-\d{2}T/.test(label);
}

function pad2(n: number): string {
    return n < 10 ? '0' + n : String(n);
}

function formatByTimeSpan(dates: Date[], years: Set<number>, months: Set<string>, days: Set<string>): string[] {
    if (years.size > 1) {
        // Multi-year: "Jul '26"
        return dates.map(d => SHORT_MONTHS[d.getUTCMonth()] + " '" + String(d.getUTCFullYear()).slice(2));
    }

    if (months.size > 1) {
        // Multi-month same year: "14 Jul"
        return dates.map(d => d.getUTCDate() + ' ' + SHORT_MONTHS[d.getUTCMonth()]);
    }

    if (days.size > 1) {
        // Multi-day same month: "14 18:24"
        return dates.map(d => d.getUTCDate() + ' ' + pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()));
    }

    // Same day: "18:24"
    return dates.map(d => pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()));
}

/**
 * Produces short x-axis labels for TrendChart.
 *
 * Priority 1: If all labels are short build numbers (≤10 chars, not ISO timestamps), return them directly.
 * Priority 2: Otherwise, abbreviate based on the time span of the visible history:
 *   - Same day → "HH:MM"
 *   - Multiple days, same month → "D HH:MM"
 *   - Multiple months, same year → "D Mon"
 *   - Multiple years → "Mon 'YY"
 */
export function abbreviateRunLabels(history: Array<{ label: string; timestamp: string }>): string[] {
    if (history.length === 0) return [];

    // Priority 1: use labels directly if they all look like build numbers
    if (history.every(h => looksLikeBuildNumber(h.label))) {
        return history.map(h => h.label);
    }

    // Priority 2: contextual date abbreviation based on timestamps
    const dates = history.map(h => new Date(h.timestamp));

    const years = new Set(dates.map(d => d.getUTCFullYear()));
    const months = new Set(dates.map(d => d.getUTCFullYear() + '-' + d.getUTCMonth()));
    const days = new Set(dates.map(d => d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate()));

    return formatByTimeSpan(dates, years, months, days);
}
