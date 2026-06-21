export function formatDuration(ms: number): string {
    if (ms === 0) return '—';
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
    const map: Record<string, string> = { SUCCESS: 'passed', FAILURE: 'failed', PENDING: 'pending', SKIPPED: 'skipped', COMPROMISED: 'compromised', ERROR: 'error' };
    return map[outcome] || 'skipped';
}

export function outcomeIcon(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: '✓', FAILURE: '✗', PENDING: '–', SKIPPED: '⊘', COMPROMISED: '⚠', ERROR: '!' };
    return map[outcome] || '?';
}
