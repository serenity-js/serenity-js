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
