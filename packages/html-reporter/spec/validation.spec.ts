import { expect, test } from '@playwright/test';

import { isValidOutcomeCode, VALID_OUTCOME_CODES } from '../src/model/outcomes.js';
import { CURRENT_RUN_DATA_SCHEMA_VERSION, isoTimestamp } from '../src/model/RunData.js';
import { IncompatibleSchemaError, InvalidRunDataError, validateRunData } from '../src/model/validation.js';

test.describe('isoTimestamp', () => {

    test('accepts a valid ISO 8601 timestamp', () => {
        const ts = isoTimestamp('2024-06-15T14:30:00.000Z');

        expect(ts).toBe('2024-06-15T14:30:00.000Z');
    });

    test('accepts a timestamp without milliseconds', () => {
        const ts = isoTimestamp('2024-06-15T14:30:00Z');

        expect(ts).toBe('2024-06-15T14:30:00Z');
    });

    test('accepts a timestamp with timezone offset', () => {
        const ts = isoTimestamp('2024-06-15T14:30:00+01:00');

        expect(ts).toBe('2024-06-15T14:30:00+01:00');
    });

    test('throws for a date-only string', () => {
        expect(() => isoTimestamp('2024-06-15')).toThrow(/Invalid ISO timestamp/);
    });

    test('throws for an empty string', () => {
        expect(() => isoTimestamp('')).toThrow(/Invalid ISO timestamp/);
    });

    test('throws for an arbitrary string', () => {
        expect(() => isoTimestamp('not a timestamp')).toThrow(/Invalid ISO timestamp/);
    });
});

test.describe('isValidOutcomeCode', () => {

    test('returns true for ExecutionSuccessful code (64)', () => {
        expect(isValidOutcomeCode(64)).toBe(true);
    });

    test('returns true for ExecutionFailedWithAssertionError code (4)', () => {
        expect(isValidOutcomeCode(4)).toBe(true);
    });

    test('returns true for all VALID_OUTCOME_CODES', () => {
        for (const code of VALID_OUTCOME_CODES) {
            expect(isValidOutcomeCode(code)).toBe(true);
        }
    });

    test('returns false for an unrecognised code', () => {
        expect(isValidOutcomeCode(999)).toBe(false);
    });

    test('returns false for zero', () => {
        expect(isValidOutcomeCode(0)).toBe(false);
    });

    test('returns false for negative numbers', () => {
        expect(isValidOutcomeCode(-1)).toBe(false);
    });
});

test.describe('validateRunData', () => {

    const validMinimalRunData = {
        schemaVersion: CURRENT_RUN_DATA_SCHEMA_VERSION,
        startedAt: '2024-06-15T14:30:00.000Z',
        finishedAt: '2024-06-15T14:30:01.000Z',
        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: [],
        tags: [],
        testRunner: { name: 'Playwright', version: '1.50.0' },
        systemContext: { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', testRunner: { name: 'Playwright', version: '1.50.0' }, browsers: [], runtime: { provider: 'node', version: 'v22' } },
    };

    test('passes validation for a minimal valid db.json', () => {
        const result = validateRunData(validMinimalRunData, '/path/to/db.json');

        expect(result).toEqual(validMinimalRunData);
    });

    test('passes validation for a full db.json with all optional fields', () => {
        const fullRunData = {
            ...validMinimalRunData,
            testRunId: 'build-42',
            attempt: 2,
        };

        const result = validateRunData(fullRunData, '/path/to/db.json');

        expect(result).toEqual(fullRunData);
    });

    test.describe('rejects non-object inputs', () => {

        test('throws InvalidRunDataError when input is null', () => {
            expect(() => validateRunData(null, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
        });

        test('throws InvalidRunDataError when input is an array', () => {
            expect(() => validateRunData([], '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
        });

        test('throws InvalidRunDataError when input is a number', () => {
            expect(() => validateRunData(42, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
        });

        test('throws InvalidRunDataError when input is a string', () => {
            expect(() => validateRunData('hello', '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
        });

        test('includes the file path in the error message', () => {
            expect(() => validateRunData(null, '/reports/test-runs/42/db.json'))
                .toThrow(/\/reports\/test-runs\/42\/db\.json/);
        });

        test('includes a helpful reason in the error message', () => {
            expect(() => validateRunData(null, '/path/to/db.json'))
                .toThrow(/must be a JSON object/);
        });
    });

    test.describe('rejects missing schemaVersion', () => {

        test('throws InvalidRunDataError when schemaVersion is missing', () => {
            const { schemaVersion: schemaVersion_, ...withoutVersion } = validMinimalRunData;

            expect(() => validateRunData(withoutVersion, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
        });

        test('includes the field name in the error message', () => {
            const { schemaVersion: schemaVersion_, ...withoutVersion } = validMinimalRunData;

            expect(() => validateRunData(withoutVersion, '/path/to/db.json'))
                .toThrow(/schemaVersion/);
        });
    });

    test.describe('rejects future schemaVersion', () => {

        test('throws IncompatibleSchemaError when schemaVersion is higher than supported', () => {
            const futureData = { ...validMinimalRunData, schemaVersion: CURRENT_RUN_DATA_SCHEMA_VERSION + 1 };

            expect(() => validateRunData(futureData, '/path/to/db.json'))
                .toThrow(IncompatibleSchemaError);
        });

        test('includes file version and supported version in the error message', () => {
            const futureVersion = CURRENT_RUN_DATA_SCHEMA_VERSION + 5;
            const futureData = { ...validMinimalRunData, schemaVersion: futureVersion };

            expect(() => validateRunData(futureData, '/path/to/db.json'))
                .toThrow(new RegExp(`version ${futureVersion}`));
        });

        test('suggests upgrading the reporter', () => {
            const futureData = { ...validMinimalRunData, schemaVersion: CURRENT_RUN_DATA_SCHEMA_VERSION + 1 };

            expect(() => validateRunData(futureData, '/path/to/db.json'))
                .toThrow(/[Uu]pgrade/);
        });
    });

    test.describe('rejects missing required fields', () => {

        test('throws when startedAt is missing', () => {
            const { startedAt: startedAt_, ...withoutStartedAt } = validMinimalRunData;

            expect(() => validateRunData(withoutStartedAt, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutStartedAt, '/path/to/db.json'))
                .toThrow(/startedAt/);
        });

        test('throws when finishedAt is missing', () => {
            const { finishedAt: finishedAt_, ...withoutFinishedAt } = validMinimalRunData;

            expect(() => validateRunData(withoutFinishedAt, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutFinishedAt, '/path/to/db.json'))
                .toThrow(/finishedAt/);
        });

        test('throws when outcomes is missing', () => {
            const { outcomes: outcomes_, ...withoutOutcomes } = validMinimalRunData;

            expect(() => validateRunData(withoutOutcomes, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutOutcomes, '/path/to/db.json'))
                .toThrow(/outcomes/);
        });

        test('throws when scenes is missing', () => {
            const { scenes: scenes_, ...withoutScenes } = validMinimalRunData;

            expect(() => validateRunData(withoutScenes, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutScenes, '/path/to/db.json'))
                .toThrow(/scenes/);
        });

        test('throws when tags is missing', () => {
            const { tags: tags_, ...withoutTags } = validMinimalRunData;

            expect(() => validateRunData(withoutTags, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutTags, '/path/to/db.json'))
                .toThrow(/tags/);
        });

        test('throws when testRunner is missing', () => {
            const { testRunner: testRunner_, ...withoutTestRunner } = validMinimalRunData;

            expect(() => validateRunData(withoutTestRunner, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(withoutTestRunner, '/path/to/db.json'))
                .toThrow(/testRunner/);
        });
    });

    test.describe('rejects wrong types for required fields', () => {

        test('throws when outcomes is a string', () => {
            const data = { ...validMinimalRunData, outcomes: 'all passed' };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes/);
        });

        test('throws when scenes is an object instead of array', () => {
            const data = { ...validMinimalRunData, scenes: {} };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/scenes/);
        });

        test('throws when tags is an object instead of array', () => {
            const data = { ...validMinimalRunData, tags: {} };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/tags/);
        });

        test('throws when testRunner is an array', () => {
            const data = { ...validMinimalRunData, testRunner: [] };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/testRunner/);
        });

        test('throws when startedAt is a number', () => {
            const data = { ...validMinimalRunData, startedAt: 123456 };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/startedAt/);
        });
    });

    test.describe('validates outcome counts', () => {

        test('throws when outcomes.passed is not a number', () => {
            const data = { ...validMinimalRunData, outcomes: { ...validMinimalRunData.outcomes, passed: '1' } };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.passed/);
        });

        test('throws when outcomes.failed is missing', () => {
            const { failed: failed_, ...partialOutcomes } = validMinimalRunData.outcomes;
            const data = { ...validMinimalRunData, outcomes: partialOutcomes };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.failed/);
        });

        test('throws when outcomes.pending is missing', () => {
            const { pending: pending_, ...partialOutcomes } = validMinimalRunData.outcomes;
            const data = { ...validMinimalRunData, outcomes: partialOutcomes };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.pending/);
        });

        test('throws when outcomes.skipped is missing', () => {
            const { skipped: skipped_, ...partialOutcomes } = validMinimalRunData.outcomes;
            const data = { ...validMinimalRunData, outcomes: partialOutcomes };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.skipped/);
        });

        test('throws when outcomes.compromised is missing', () => {
            const { compromised: compromised_, ...partialOutcomes } = validMinimalRunData.outcomes;
            const data = { ...validMinimalRunData, outcomes: partialOutcomes };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.compromised/);
        });

        test('throws when outcomes.error is missing', () => {
            const { error: error_, ...partialOutcomes } = validMinimalRunData.outcomes;
            const data = { ...validMinimalRunData, outcomes: partialOutcomes };

            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(InvalidRunDataError);
            expect(() => validateRunData(data, '/path/to/db.json'))
                .toThrow(/outcomes\.error/);
        });
    });

    test.describe('error class properties', () => {

        test('InvalidRunDataError exposes path and reason', () => {
            try {
                validateRunData(null, '/my/path.json');
                test.fail(true, 'should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidRunDataError);
                expect((error as InvalidRunDataError).path).toBe('/my/path.json');
                expect((error as InvalidRunDataError).reason).toContain('must be a JSON object');
            }
        });

        test('IncompatibleSchemaError exposes path, fileVersion, and supportedVersion', () => {
            const futureData = { ...validMinimalRunData, schemaVersion: 99 };

            try {
                validateRunData(futureData, '/my/path.json');
                test.fail(true, 'should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(IncompatibleSchemaError);
                expect((error as IncompatibleSchemaError).path).toBe('/my/path.json');
                expect((error as IncompatibleSchemaError).fileVersion).toBe(99);
                expect((error as IncompatibleSchemaError).supportedVersion).toBe(CURRENT_RUN_DATA_SCHEMA_VERSION);
            }
        });
    });
});
