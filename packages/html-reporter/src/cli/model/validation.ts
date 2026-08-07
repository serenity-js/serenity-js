import type { RunData } from './RunData.js';
import { CURRENT_RUN_DATA_SCHEMA_VERSION } from './RunData.js';
import { RunDataSchema } from './RunDataSchema.js';

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
    // Pre-check: must be a JSON object (not null, array, or primitive)
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new InvalidRunDataError(sourcePath, 'must be a JSON object');
    }

    // Semantic check: schema version compatibility (before structural validation)
    const object = raw as Record<string, unknown>;
    if (typeof object.schemaVersion === 'number' && object.schemaVersion > CURRENT_RUN_DATA_SCHEMA_VERSION) {
        throw new IncompatibleSchemaError(sourcePath, object.schemaVersion, CURRENT_RUN_DATA_SCHEMA_VERSION);
    }

    // Structural validation via Zod
    const result = RunDataSchema.safeParse(raw);
    if (!result.success) {
        const firstIssue = result.error.issues[0];
        const path = firstIssue.path.join('.');
        throw new InvalidRunDataError(sourcePath, formatZodError(path, firstIssue.message));
    }

    return result.data as RunData;
}

/**
 * Formats a Zod validation error into a human-readable message.
 */
function formatZodError(path: string, message: string): string {
    // Zod's "Required" message for missing fields
    if (message === 'Required') {
        return path
            ? `missing required field "${path}"`
            : 'missing required field "schemaVersion"';
    }

    // Type mismatch errors
    if (message.startsWith('Expected')) {
        return path
            ? `${path}: ${message.toLowerCase()}`
            : message.toLowerCase();
    }

    // Default: include path if present
    return path ? `${path}: ${message}` : message;
}
