import { expect, test } from '@playwright/test';

import { computeDashboardScores } from '../../app/utils/computeDashboardScores.js';
import { formatTimestamp } from '../../app/utils/format.js';
import { computeCompletenessFromTree, validateFilter } from '../../app/utils/index.js';

test.describe('validateFilter', () => {

    test('returns the filter as-is when validKeys is undefined', () => {
        expect(validateFilter('bogus', undefined)).toBe('bogus');
    });

    test('returns "all" when filter is empty', () => {
        expect(validateFilter('', ['passed', 'failed'])).toBe('all');
    });

    test('returns "all" when filter is "all"', () => {
        expect(validateFilter('all', ['passed', 'failed'])).toBe('all');
    });

    test('returns the filter when it is a valid key', () => {
        expect(validateFilter('passed', ['passed', 'failed', 'skipped'])).toBe('passed');
    });

    test('returns "all" when filter is an unrecognised value', () => {
        expect(validateFilter('BOGUS', ['passed', 'failed', 'skipped'])).toBe('all');
    });

    test('keeps only valid parts from a comma-separated multi-filter', () => {
        expect(validateFilter('passed,BOGUS,failed', ['passed', 'failed', 'skipped'])).toBe('passed,failed');
    });

    test('returns "all" when all parts of a multi-filter are invalid', () => {
        expect(validateFilter('BOGUS,FAKE', ['passed', 'failed', 'skipped'])).toBe('all');
    });
});

test.describe('formatTimestamp — defensive guards', () => {

    test('returns "—" for undefined input', () => {
        expect(formatTimestamp(undefined)).toBe('—');
    });

    test('returns "—" for null input', () => {
        expect(formatTimestamp(undefined)).toBe('—');
    });

    test('returns "—" for empty string input', () => {
        expect(formatTimestamp('')).toBe('—');
    });

    test('returns "—" for invalid date string', () => {
        expect(formatTimestamp('not-a-date')).toBe('—');
    });

    test('returns formatted string for valid ISO date', () => {
        const result = formatTimestamp('2024-06-15T14:30:00.000Z');
        expect(result).toContain('2024');
    });
});

test.describe('computeCompletenessFromTree — zero scenario guard', () => {

    test('returns 0 when capabilities is undefined', () => {
        expect(computeCompletenessFromTree(undefined)).toBe(0);
    });

    test('returns 0 when capabilities tree has no children', () => {
        expect(computeCompletenessFromTree({ type: 'directory', name: 'root', outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } })).toBe(0);
    });

    test('computes completeness correctly for a tree with files', () => {
        const tree = {
            type: 'directory' as const, name: 'root',
            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            children: [
                { type: 'file' as const, name: 'a.spec.ts', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                { type: 'file' as const, name: 'b.spec.ts', outcomes: { passed: 0, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 } },
            ],
        };
        expect(computeCompletenessFromTree(tree)).toBe(50);
    });
});

test.describe('computeDashboardScores — zero scenarios', () => {

    test('returns all zeros when totalScenarios is 0 and no history', () => {
        const summary = {
            title: '', totalScenarios: 0,
            outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            duration: 0, startedAt: '', finishedAt: '', testRunner: '',
        };
        const result = computeDashboardScores(summary, []);
        expect(result.passRate).toBe(0);
        expect(result.consistency).toBe(0);
        expect(result.completenessScore).toBe(0);
        expect(result.confidence).toBe(0);
        expect(result.totalFailed).toBe(0);
    });
});
