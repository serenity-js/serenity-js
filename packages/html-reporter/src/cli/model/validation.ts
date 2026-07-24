import type { RunData } from './RunData.js';
import { CURRENT_RUN_DATA_SCHEMA_VERSION } from './RunData.js';

/**
 * Thrown when a db.json file cannot be parsed as valid RunData.
 *
 * @package
 */
export class InvalidRunDataError extends Error {
    constructor(
        public readonly path: string,
        public readonly reason: string,
    ) {
        super(`Invalid db.json at ${path}: ${reason}`);
        this.name = 'InvalidRunDataError';
    }
}

/**
 * Thrown when a db.json file uses a schema version newer than this reporter supports.
 *
 * @package
 */
export class IncompatibleSchemaError extends Error {
    constructor(
        public readonly path: string,
        public readonly fileVersion: number,
        public readonly supportedVersion: number,
    ) {
        super(
            `db.json at ${path} uses schema version ${fileVersion}, ` +
            `but this version of the reporter supports version ${supportedVersion}. ` +
            `Upgrade @serenity-js/html-reporter to read this file.`
        );
        this.name = 'IncompatibleSchemaError';
    }
}

/**
 * Validates that `raw` is a structurally valid RunData object.
 *
 * Checks the top-level shape only (required fields and their types).
 * Does not deeply validate scenes or activities — the producer is trusted code.
 *
 * @param raw - The parsed JSON value from a db.json file
 * @param sourcePath - The filesystem path for error messages
 * @returns The validated RunData object
 * @throws InvalidRunDataError when the object is missing required fields or has wrong types
 * @throws IncompatibleSchemaError when schemaVersion is higher than supported
 *
 * @package
 */
export function validateRunData(raw: unknown, sourcePath: string): RunData {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new InvalidRunDataError(sourcePath, 'must be a JSON object');
    }

    const object = raw as Record<string, unknown>;

    // Schema version check
    if (typeof object.schemaVersion !== 'number') {
        throw new InvalidRunDataError(sourcePath, 'missing required field "schemaVersion"');
    }
    if (object.schemaVersion > CURRENT_RUN_DATA_SCHEMA_VERSION) {
        throw new IncompatibleSchemaError(sourcePath, object.schemaVersion, CURRENT_RUN_DATA_SCHEMA_VERSION);
    }

    // Required string fields
    assertString(object, 'startedAt', sourcePath);

    // Optional string fields (absent in placeholder db.json from incomplete runs)
    // finishedAt: absent when the test process crashed before TestRunFinishes
    // testRunner: absent when the test process crashed before TestRunnerDetected
    if (object.finishedAt !== undefined && typeof object.finishedAt !== 'string') {
        throw new InvalidRunDataError(sourcePath, 'field "finishedAt" must be a string when present');
    }
    if (object.testRunner !== undefined && (typeof object.testRunner !== 'object' || object.testRunner === null || Array.isArray(object.testRunner))) {
        throw new InvalidRunDataError(sourcePath, 'field "testRunner" must be an object when present');
    }

    // Required object fields
    assertObject(object, 'outcomes', sourcePath);

    // Required array fields
    assertArray(object, 'scenes', sourcePath);
    assertArray(object, 'tags', sourcePath);

    // Outcomes must have all required counts
    const outcomes = object.outcomes as Record<string, unknown>;
    for (const key of ['passed', 'failed', 'pending', 'skipped', 'compromised', 'error']) {
        if (typeof outcomes[key] !== 'number') {
            throw new InvalidRunDataError(sourcePath, `outcomes.${key} must be a number`);
        }
    }

    return raw as RunData;
}

function assertString(object: Record<string, unknown>, field: string, path: string): void {
    if (typeof object[field] !== 'string') {
        throw new InvalidRunDataError(path, `missing or invalid required field "${field}" (expected string)`);
    }
}

function assertObject(object: Record<string, unknown>, field: string, path: string): void {
    if (object[field] === null || typeof object[field] !== 'object' || Array.isArray(object[field])) {
        throw new InvalidRunDataError(path, `missing or invalid required field "${field}" (expected object)`);
    }
}

function assertArray(object: Record<string, unknown>, field: string, path: string): void {
    if (!Array.isArray(object[field])) {
        throw new InvalidRunDataError(path, `missing or invalid required field "${field}" (expected array)`);
    }
}
