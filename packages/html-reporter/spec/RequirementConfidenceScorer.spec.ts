import { expect, test } from '@playwright/test';

import { computeCompleteness, computeConfidence, computeDelta, computePassRate, computeConsistency, scoreDirectory, scoreRequirement } from '../src/RequirementConfidenceScorer.js';

test.describe('RequirementConfidenceScorer', () => {

    test.describe('computePassRate', () => {

        test('returns 100 when all scenarios pass', () => {
            const outcomes = { passed: 5, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(100);
        });

        test('returns 0 when no scenarios pass', () => {
            const outcomes = { passed: 0, failed: 3, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(0);
        });

        test('excludes skipped and pending from the denominator', () => {
            // 4 passed out of 4 executed (2 skipped + 1 pending are excluded)
            const outcomes = { passed: 4, failed: 0, pending: 1, skipped: 2, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(100);
        });

        test('computes percentage of passing among executed scenarios', () => {
            // 3 passed out of 5 executed (1 pending excluded)
            const outcomes = { passed: 3, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(60);
        });

        test('returns 0 when there are no scenarios', () => {
            const outcomes = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(0);
        });

        test('returns 0 when all scenarios are skipped or pending', () => {
            const outcomes = { passed: 0, failed: 0, pending: 3, skipped: 2, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(0);
        });

        test('treats compromised and error as non-passing executed scenarios', () => {
            // 2 passed out of 4 executed (2 + 1 compromised + 1 error)
            const outcomes = { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 1, error: 1 };

            expect(computePassRate(outcomes)).toBe(50);
        });

        test('rounds to the nearest integer', () => {
            // 1 passed out of 3 executed = 33.33... → 33
            const outcomes = { passed: 1, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computePassRate(outcomes)).toBe(33);
        });
    });

    test.describe('computeCompleteness', () => {

        test('returns 100 when all scenarios are implemented (no pending/skipped)', () => {
            const outcomes = { passed: 3, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(100);
        });

        test('returns 0 when there are no scenarios', () => {
            const outcomes = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(0);
        });

        test('returns 0 when all scenarios are pending or skipped', () => {
            const outcomes = { passed: 0, failed: 0, pending: 2, skipped: 3, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(0);
        });

        test('computes percentage of implemented scenarios', () => {
            // 6 implemented out of 8 total (2 pending)
            const outcomes = { passed: 4, failed: 2, pending: 2, skipped: 0, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(75);
        });

        test('treats both skipped and pending as not implemented', () => {
            // 5 implemented out of 10 total
            const outcomes = { passed: 3, failed: 2, pending: 3, skipped: 2, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(50);
        });

        test('rounds to the nearest integer', () => {
            // 2 implemented out of 3 total = 66.67 → 67
            const outcomes = { passed: 1, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 };

            expect(computeCompleteness(outcomes)).toBe(67);
        });
    });

    test.describe('computeConsistency', () => {

        test('returns 100 when all scenarios have consistent outcomes', () => {
            const scenarios = [
                { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                { name: 'B', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
            ];

            expect(computeConsistency(scenarios)).toBe(100);
        });

        test('returns 100 when there is only one run of history', () => {
            const scenarios = [
                { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS'] },
            ];

            expect(computeConsistency(scenarios)).toBe(100);
        });

        test('returns 100 when execution history is empty', () => {
            const scenarios = [
                { name: 'A', outcome: 'SUCCESS' },
            ];

            expect(computeConsistency(scenarios)).toBe(100);
        });

        test('returns 0 when outcomes flip every run', () => {
            const scenarios = [
                { name: 'A', outcome: 'FAILURE', executionHistory: ['SUCCESS', 'FAILURE', 'SUCCESS', 'FAILURE', 'SUCCESS'] },
            ];

            // 4 flips out of 4 transitions = flip rate 1.0 → consistency 0
            expect(computeConsistency(scenarios)).toBe(0);
        });

        test('computes average consistency across multiple scenarios', () => {
            const scenarios = [
                // Scenario A: 0 flips out of 4 transitions → consistency 100%
                { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS'] },
                // Scenario B: 4 flips out of 4 transitions → consistency 0%
                { name: 'B', outcome: 'FAILURE', executionHistory: ['SUCCESS', 'FAILURE', 'SUCCESS', 'FAILURE', 'SUCCESS'] },
            ];

            // Average: (100 + 0) / 2 = 50
            expect(computeConsistency(scenarios)).toBe(50);
        });

        test('handles a single flip in history', () => {
            const scenarios = [
                // 1 flip out of 4 transitions → flip rate 0.25 → consistency 75%
                { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILURE', 'FAILURE'] },
            ];

            expect(computeConsistency(scenarios)).toBe(75);
        });

        test('returns 100 when scenarios array is empty', () => {
            expect(computeConsistency([])).toBe(100);
        });
    });

    test.describe('computeConfidence', () => {

        test('returns weighted combination: 0.40×passRate + 0.25×completeness + 0.35×consistency', () => {
            // passRate=100, completeness=100, consistency=100
            // confidence = 0.40×100 + 0.25×100 + 0.35×100 = 100
            expect(computeConfidence({ passRate: 100, completeness: 100, consistency: 100 })).toBe(100);
        });

        test('returns 0 when all sub-scores are 0', () => {
            expect(computeConfidence({ passRate: 0, completeness: 0, consistency: 0 })).toBe(0);
        });

        test('weights pass rate highest', () => {
            // Only pass rate is 100, others are 0
            // confidence = 0.40×100 + 0.25×0 + 0.35×0 = 40
            expect(computeConfidence({ passRate: 100, completeness: 0, consistency: 0 })).toBe(40);
        });

        test('weights consistency second highest', () => {
            // Only consistency is 100, others are 0
            // confidence = 0.40×0 + 0.25×0 + 0.35×100 = 35
            expect(computeConfidence({ passRate: 0, completeness: 0, consistency: 100 })).toBe(35);
        });

        test('weights completeness lowest', () => {
            // Only completeness is 100, others are 0
            // confidence = 0.40×0 + 0.25×100 + 0.35×0 = 25
            expect(computeConfidence({ passRate: 0, completeness: 100, consistency: 0 })).toBe(25);
        });

        test('computes a realistic mixed score', () => {
            // passRate=80, completeness=90, consistency=60
            // confidence = 0.40×80 + 0.25×90 + 0.35×60 = 32 + 22.5 + 21 = 75.5 → 76
            expect(computeConfidence({ passRate: 80, completeness: 90, consistency: 60 })).toBe(76);
        });

        test('rounds to the nearest integer', () => {
            // passRate=33, completeness=67, consistency=75
            // confidence = 0.40×33 + 0.25×67 + 0.35×75 = 13.2 + 16.75 + 26.25 = 56.2 → 56
            expect(computeConfidence({ passRate: 33, completeness: 67, consistency: 75 })).toBe(56);
        });
    });

    test.describe('scoreRequirement (penalties)', () => {

        test('returns confidence 0 when there are no scenarios', () => {
            const node = {
                outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenarios: [],
            };

            const score = scoreRequirement(node);

            expect(score.confidence).toBe(0);
        });

        test('returns confidence 0 when all scenarios are skipped', () => {
            const node = {
                outcomes: { passed: 0, failed: 0, pending: 0, skipped: 3, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'SKIPPED' },
                    { name: 'B', outcome: 'SKIPPED' },
                    { name: 'C', outcome: 'SKIPPED' },
                ],
            };

            const score = scoreRequirement(node);

            expect(score.confidence).toBe(0);
        });

        test('computes confidence without penalty for recent regression (captured by consistency)', () => {
            const node = {
                outcomes: { passed: 4, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                    { name: 'B', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                    { name: 'C', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                    { name: 'D', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                    // This one regressed: was passing, now failing
                    { name: 'E', outcome: 'FAILURE', executionHistory: ['SUCCESS', 'SUCCESS', 'FAILURE'] },
                ],
            };

            const score = scoreRequirement(node);

            // passRate=80, completeness=100
            // scenario E has history [S,S,F] → 1 flip/2 transitions = 0.5 flip rate
            // All others have 0 flips. Average flip rate = 0.5/5 = 0.1 → consistency = 90
            // confidence = 0.40×80 + 0.25×100 + 0.35×90 = 32 + 25 + 31.5 = 88.5 → 89
            expect(score.confidence).toBe(89);
        });

        test('single scenario with all passing gives 100% confidence', () => {
            const node = {
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                ],
            };

            const score = scoreRequirement(node);

            // passRate=100, completeness=100, consistency=100
            // confidence = 100 (no penalties)
            expect(score.confidence).toBe(100);
        });

        test('confidence cannot go below 0', () => {
            const node = {
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'FAILURE', executionHistory: ['SUCCESS', 'FAILURE'] },
                ],
            };

            const score = scoreRequirement(node);

            // passRate=0, completeness=100, consistency=0 (1 flip / 1 transition)
            // confidence = 0.40×0 + 0.25×100 + 0.35×0 = 25
            expect(score.confidence).toBe(25);
        });

        test('consistently failing scenario gives low confidence from pass rate', () => {
            const node = {
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'FAILURE', executionHistory: ['FAILURE', 'FAILURE', 'FAILURE'] },
                ],
            };

            const score = scoreRequirement(node);

            // passRate=0, completeness=100, consistency=100 (no flips)
            // confidence = 0.40×0 + 0.25×100 + 0.35×100 = 60
            expect(score.confidence).toBe(60);
        });

        test('populates all sub-scores in the returned object', () => {
            const node = {
                outcomes: { passed: 3, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
                scenarios: [
                    { name: 'A', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS'] },
                    { name: 'B', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS'] },
                    { name: 'C', outcome: 'SUCCESS', executionHistory: ['SUCCESS', 'SUCCESS'] },
                    { name: 'D', outcome: 'FAILURE', executionHistory: ['FAILURE', 'FAILURE'] },
                    { name: 'E', outcome: 'PENDING' },
                ],
            };

            const score = scoreRequirement(node);

            expect(score.passRate).toBe(75);        // 3 of 4 executed
            expect(score.completeness).toBe(80);    // 4 of 5 implemented
            expect(score.consistency).toBe(100);      // no flips
        });
    });

    test.describe('scoreDirectory', () => {

        test('aggregates children weighted by scenario count', () => {
            const children = [
                { confidence: 100, scenarioCount: 10 },
                { confidence: 50, scenarioCount: 10 },
            ];

            // (100×10 + 50×10) / (10 + 10) = 1500/20 = 75
            expect(scoreDirectory(children)).toBe(75);
        });

        test('gives more weight to children with more scenarios', () => {
            const children = [
                { confidence: 100, scenarioCount: 90 },
                { confidence: 0, scenarioCount: 10 },
            ];

            // (100×90 + 0×10) / (90 + 10) = 9000/100 = 90
            expect(scoreDirectory(children)).toBe(90);
        });

        test('returns 0 when there are no children', () => {
            expect(scoreDirectory([])).toBe(0);
        });

        test('returns 0 when total scenario count is 0', () => {
            const children = [
                { confidence: 100, scenarioCount: 0 },
                { confidence: 80, scenarioCount: 0 },
            ];

            expect(scoreDirectory(children)).toBe(0);
        });

        test('rounds to the nearest integer', () => {
            const children = [
                { confidence: 100, scenarioCount: 1 },
                { confidence: 0, scenarioCount: 2 },
            ];

            // (100×1 + 0×2) / (1 + 2) = 100/3 = 33.33 → 33
            expect(scoreDirectory(children)).toBe(33);
        });
    });

    test.describe('computeDelta', () => {

        test('returns positive delta when confidence improved', () => {
            expect(computeDelta(80, 70)).toBe(10);
        });

        test('returns negative delta when confidence degraded', () => {
            expect(computeDelta(60, 80)).toBe(-20);
        });

        test('returns 0 when confidence is unchanged', () => {
            expect(computeDelta(85, 85)).toBe(0);
        });

        test('returns undefined when there is no previous score', () => {
            expect(computeDelta(75, undefined)).toBeUndefined();
        });
    });
});
