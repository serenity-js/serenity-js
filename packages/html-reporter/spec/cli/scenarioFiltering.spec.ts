import { expect, test } from '@playwright/test';

import { computeFilterCounts, computeFilteredScenarios, groupByCategory } from '../../app/utils/scenarioFiltering.js';

function scenario(overrides: Partial<{ name: string; category: string; outcome: string; duration: number }>): any {
    return {
        name: overrides.name || 'Test',
        category: overrides.category || 'Suite',
        outcome: overrides.outcome || 'SUCCESS',
        duration: overrides.duration || 100,
        startedAt: '2024-01-01T00:00:00.000Z',
        source: { path: 'test.spec.ts', line: 1 },
        tags: [],
        activities: [],
        executionHistory: [],
    };
}

test.describe('computeFilteredScenarios', () => {

    test('returns all scenarios when no filter or search applied', () => {
        const scenarios = [scenario({ name: 'A' }), scenario({ name: 'B' })];
        const result = computeFilteredScenarios(scenarios, 'all', '', 'name');
        expect(result).toHaveLength(2);
    });

    test('filters by outcome', () => {
        const scenarios = [
            scenario({ name: 'Pass', outcome: 'SUCCESS' }),
            scenario({ name: 'Fail', outcome: 'FAILURE' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'failed', '', 'name');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Fail');
    });

    test('filters by search term (name)', () => {
        const scenarios = [
            scenario({ name: 'Login test' }),
            scenario({ name: 'Checkout test' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', 'Login', 'name');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Login test');
    });

    test('searches across name, category, and source path', () => {
        const scenarios = [
            scenario({ name: 'Test A', category: 'Authentication' }),
            scenario({ name: 'Test B', category: 'Checkout' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', 'Authentication', 'name');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Test A');
    });

    test('sorts by name alphabetically', () => {
        const scenarios = [
            scenario({ name: 'Zebra' }),
            scenario({ name: 'Alpha' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', '', 'name');
        expect(result[0].name).toBe('Alpha');
        expect(result[1].name).toBe('Zebra');
    });

    test('sorts by duration (slowest first)', () => {
        const scenarios = [
            scenario({ name: 'Fast', duration: 50 }),
            scenario({ name: 'Slow', duration: 500 }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', '', 'duration');
        expect(result[0].name).toBe('Slow');
    });

    test('sorts by status (failures first)', () => {
        const scenarios = [
            scenario({ name: 'Pass', outcome: 'SUCCESS' }),
            scenario({ name: 'Fail', outcome: 'FAILURE' }),
            scenario({ name: 'Error', outcome: 'ERROR' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', '', 'status');
        expect(result[0].name).toBe('Fail');
        expect(result[1].name).toBe('Error');
        expect(result[2].name).toBe('Pass');
    });

    test('sorts by category then name', () => {
        const scenarios = [
            scenario({ name: 'B', category: 'Auth' }),
            scenario({ name: 'A', category: 'Checkout' }),
            scenario({ name: 'A', category: 'Auth' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'all', '', 'category');
        expect(result[0].name).toBe('A');
        expect(result[0].category).toBe('Auth');
        expect(result[1].name).toBe('B');
        expect(result[1].category).toBe('Auth');
        expect(result[2].category).toBe('Checkout');
    });

    test('applies both filter and search together', () => {
        const scenarios = [
            scenario({ name: 'Login pass', outcome: 'SUCCESS' }),
            scenario({ name: 'Login fail', outcome: 'FAILURE' }),
            scenario({ name: 'Checkout fail', outcome: 'FAILURE' }),
        ];
        const result = computeFilteredScenarios(scenarios, 'failed', 'Login', 'name');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Login fail');
    });

    test('does not mutate the input array', () => {
        const scenarios = [
            scenario({ name: 'Zebra' }),
            scenario({ name: 'Alpha' }),
        ];
        const original = [...scenarios];
        computeFilteredScenarios(scenarios, 'all', '', 'name');
        expect(scenarios[0].name).toBe(original[0].name);
        expect(scenarios[1].name).toBe(original[1].name);
    });
});

test.describe('computeFilterCounts', () => {

    test('counts scenarios by outcome category', () => {
        const scenarios = [
            scenario({ outcome: 'SUCCESS' }),
            scenario({ outcome: 'SUCCESS' }),
            scenario({ outcome: 'FAILURE' }),
            scenario({ outcome: 'SKIPPED' }),
        ];
        const counts = computeFilterCounts(scenarios);
        expect(counts.total).toBe(4);
        expect(counts.passed).toBe(2);
        expect(counts.failed).toBe(1);
        expect(counts.skipped).toBe(1);
    });

    test('groups ERROR and COMPROMISED under failed', () => {
        const scenarios = [
            scenario({ outcome: 'ERROR' }),
            scenario({ outcome: 'COMPROMISED' }),
        ];
        const counts = computeFilterCounts(scenarios);
        expect(counts.failed).toBe(2);
        expect(counts.passed).toBe(0);
    });

    test('groups PENDING under skipped', () => {
        const scenarios = [
            scenario({ outcome: 'PENDING' }),
            scenario({ outcome: 'SKIPPED' }),
        ];
        const counts = computeFilterCounts(scenarios);
        expect(counts.skipped).toBe(2);
    });

    test('returns zeros for empty input', () => {
        const counts = computeFilterCounts([]);
        expect(counts.total).toBe(0);
        expect(counts.passed).toBe(0);
        expect(counts.failed).toBe(0);
        expect(counts.skipped).toBe(0);
    });

    test('total equals the sum of all categories', () => {
        const scenarios = [
            scenario({ outcome: 'SUCCESS' }),
            scenario({ outcome: 'FAILURE' }),
            scenario({ outcome: 'ERROR' }),
            scenario({ outcome: 'COMPROMISED' }),
            scenario({ outcome: 'SKIPPED' }),
            scenario({ outcome: 'PENDING' }),
        ];
        const counts = computeFilterCounts(scenarios);
        expect(counts.total).toBe(6);
        expect(counts.passed + counts.failed + counts.skipped).toBe(6);
    });
});

test.describe('groupByCategory', () => {

    test('groups scenarios by their category field', () => {
        const scenarios = [
            scenario({ name: 'A', category: 'Auth' }),
            scenario({ name: 'B', category: 'Checkout' }),
            scenario({ name: 'C', category: 'Auth' }),
        ];
        const groups = groupByCategory(scenarios);
        expect(Object.keys(groups)).toHaveLength(2);
        expect(groups['Auth']).toHaveLength(2);
        expect(groups['Checkout']).toHaveLength(1);
    });

    test('returns empty object for empty input', () => {
        const groups = groupByCategory([]);
        expect(Object.keys(groups)).toHaveLength(0);
    });

    test('preserves scenario order within each group', () => {
        const scenarios = [
            scenario({ name: 'First', category: 'Auth' }),
            scenario({ name: 'Second', category: 'Auth' }),
            scenario({ name: 'Third', category: 'Auth' }),
        ];
        const groups = groupByCategory(scenarios);
        expect(groups['Auth'][0].name).toBe('First');
        expect(groups['Auth'][1].name).toBe('Second');
        expect(groups['Auth'][2].name).toBe('Third');
    });
});
