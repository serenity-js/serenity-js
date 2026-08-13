import { expect, test } from '@playwright/test';

import { abbreviateRunLabels } from '../../app/utils/format';

test.describe('abbreviateRunLabels', () => {

    test.describe('Priority 1: build number labels', () => {

        test('returns run labels directly when they are short build numbers', () => {
            const history = [
                { label: '#8290', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: '#8291', timestamp: '2026-07-14T22:19:00.000Z' },
                { label: '#8292', timestamp: '2026-07-15T09:15:00.000Z' },
            ];

            expect(abbreviateRunLabels(history)).toEqual(['#8290', '#8291', '#8292']);
        });

        test('returns short non-ISO labels directly', () => {
            const history = [
                { label: 'build 42', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: 'build 43', timestamp: '2026-07-15T09:15:00.000Z' },
            ];

            expect(abbreviateRunLabels(history)).toEqual(['build 42', 'build 43']);
        });

        test('treats labels that are ISO timestamps as needing abbreviation', () => {
            const history = [
                { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: '2026-07-14T22:19:00.000Z', timestamp: '2026-07-14T22:19:00.000Z' },
            ];

            const result = abbreviateRunLabels(history);

            // Should NOT contain ISO format — should be abbreviated
            expect(result[0]).not.toContain('2026-07-14T');
            expect(result[1]).not.toContain('2026-07-14T');
        });

        test('treats labels longer than 10 chars that look like timestamps as needing abbreviation', () => {
            const history = [
                { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: '2026-07-15T09:15:00.000Z', timestamp: '2026-07-15T09:15:00.000Z' },
            ];

            const result = abbreviateRunLabels(history);

            // Same-month multi-day → day + time
            expect(result[0]).toBe('14 18:24');
            expect(result[1]).toBe('15 09:15');
        });
    });

    test.describe('Priority 2: contextual date abbreviation', () => {

        test.describe('same day → time only', () => {

            test('shows just the time when all bars are from the same day', () => {
                const history = [
                    { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                    { label: '2026-07-14T22:19:00.000Z', timestamp: '2026-07-14T22:19:00.000Z' },
                    { label: '2026-07-14T23:05:00.000Z', timestamp: '2026-07-14T23:05:00.000Z' },
                ];

                expect(abbreviateRunLabels(history)).toEqual(['18:24', '22:19', '23:05']);
            });

            test('zero-pads hours and minutes', () => {
                const history = [
                    { label: '2026-07-14T08:05:00.000Z', timestamp: '2026-07-14T08:05:00.000Z' },
                    { label: '2026-07-14T09:09:00.000Z', timestamp: '2026-07-14T09:09:00.000Z' },
                ];

                expect(abbreviateRunLabels(history)).toEqual(['08:05', '09:09']);
            });
        });

        test.describe('multiple days within same month → day + time', () => {

            test('shows day and time when bars span multiple days in the same month', () => {
                const history = [
                    { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                    { label: '2026-07-15T09:15:00.000Z', timestamp: '2026-07-15T09:15:00.000Z' },
                    { label: '2026-07-16T11:30:00.000Z', timestamp: '2026-07-16T11:30:00.000Z' },
                ];

                expect(abbreviateRunLabels(history)).toEqual(['14 18:24', '15 09:15', '16 11:30']);
            });
        });

        test.describe('multiple months within same year → day + month', () => {

            test('shows day and month when bars span multiple months', () => {
                const history = [
                    { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                    { label: '2026-08-03T09:15:00.000Z', timestamp: '2026-08-03T09:15:00.000Z' },
                    { label: '2026-09-21T14:00:00.000Z', timestamp: '2026-09-21T14:00:00.000Z' },
                ];

                expect(abbreviateRunLabels(history)).toEqual(['14 Jul', '3 Aug', '21 Sep']);
            });
        });

        test.describe('multiple years → month + year', () => {

            test('shows month and abbreviated year when bars span multiple years', () => {
                const history = [
                    { label: '2025-11-14T18:24:00.000Z', timestamp: '2025-11-14T18:24:00.000Z' },
                    { label: '2026-01-03T09:15:00.000Z', timestamp: '2026-01-03T09:15:00.000Z' },
                    { label: '2026-07-21T14:00:00.000Z', timestamp: '2026-07-21T14:00:00.000Z' },
                ];

                expect(abbreviateRunLabels(history)).toEqual(["Nov '25", "Jan '26", "Jul '26"]);
            });
        });
    });

    test.describe('edge cases', () => {

        test('returns an empty array for empty input', () => {
            expect(abbreviateRunLabels([])).toEqual([]);
        });

        test('handles a single entry (same day → time only)', () => {
            const history = [
                { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
            ];

            expect(abbreviateRunLabels(history)).toEqual(['18:24']);
        });

        test('uses timestamps for abbreviation even when labels differ but are long ISO-like strings', () => {
            const history = [
                { label: '2026-07-14T18:24:00.000Z', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: '2026-08-03T09:15:00.000Z', timestamp: '2026-08-03T09:15:00.000Z' },
            ];

            expect(abbreviateRunLabels(history)).toEqual(['14 Jul', '3 Aug']);
        });

        test('mixes: if ANY label looks like a build number (short, non-ISO), uses labels directly', () => {
            // When all labels are short build numbers, use them
            const history = [
                { label: '#100', timestamp: '2026-07-14T18:24:00.000Z' },
                { label: '#101', timestamp: '2026-07-15T09:15:00.000Z' },
            ];

            expect(abbreviateRunLabels(history)).toEqual(['#100', '#101']);
        });

        test('falls back to abbreviation when labels are long and ISO-like', () => {
            const history = [
                { label: '2026-07-14T18:24:00.000+01:00', timestamp: '2026-07-14T17:24:00.000Z' },
                { label: '2026-07-15T09:15:00.000+01:00', timestamp: '2026-07-15T08:15:00.000Z' },
            ];

            const result = abbreviateRunLabels(history);

            // Should use day + time from timestamps (multi-day same month)
            expect(result[0]).toBe('14 17:24');
            expect(result[1]).toBe('15 08:15');
        });
    });
});
