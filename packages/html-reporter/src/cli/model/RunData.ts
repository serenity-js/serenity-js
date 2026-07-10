import type { SerialisedOutcome } from '@serenity-js/core/model';

import type { SystemContext } from '../SystemContextDetector.js';

/**
 * Current schema version of the RunData model.
 * Increment when making structural changes to the db.json format.
 */
export const CURRENT_RUN_DATA_SCHEMA_VERSION = 1;

/**
 * Branded type for ISO 8601 timestamp strings.
 * Prevents accidentally passing arbitrary strings where timestamps are expected.
 */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

/**
 * Creates a branded ISOTimestamp from a string value.
 * Performs a basic format check to catch obviously invalid values.
 *
 * @param value - An ISO 8601 date-time string (e.g. `2024-06-15T14:30:00.000Z`)
 * @throws Error if the value does not match the expected format
 */
export function isoTimestamp(value: string): ISOTimestamp {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        throw new Error(`Invalid ISO timestamp: ${value}`);
    }
    return value as ISOTimestamp;
}

/**
 * The data model for a single test run, serialised as db.json.
 *
 * @package
 */
export interface RunData {
    schemaVersion: number;
    testRunId?: string;
    attempt?: number;      // 1-based CI job attempt number. Default: 1
    startedAt: string;
    finishedAt: string;
    outcomes: OutcomeCounts;
    scenes: SceneRecord[];
    tags: TagRecord[];
    testRunner: { name: string; version: string };
    systemContext: SystemContext;
}

export interface OutcomeCounts {
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
    compromised: number;
    error: number;
}

interface BaseSceneRecord {
    name: string;
    category: string;
    outcome: SerialisedOutcome;
    duration: number;
    startedAt: string;
    source: { path: string; line: number };
    tags: TagRecord[];
    activities: ActivityRecord[];
    error?: ErrorRecord;
    video?: string;
    cast?: ActorRecord[];
    narrative?: string;
    description?: string;
    artifacts?: ArtifactReference[];
}

interface SimpleSceneRecord extends BaseSceneRecord {
    scenarioOutline?: never;
    attempts?: never;
    retries?: never;
}

interface RetriedSceneRecord extends BaseSceneRecord {
    retries: number;
    attempts: AttemptRecord[];
    scenarioOutline?: never;
}

interface OutlineSceneRecord extends BaseSceneRecord {
    scenarioOutline: {
        template: string;
        parameters: ScenarioParameterSet[];
    };
    attempts?: never;
    retries?: never;
}

export type SceneRecord = SimpleSceneRecord | RetriedSceneRecord | OutlineSceneRecord;

export interface ScenarioParameterSet {
    name: string;
    description?: string;
    values: Record<string, string>;
    outcome: SerialisedOutcome;
    duration: number;
    activities: ActivityRecord[];
}

export interface ActivityRecord {
    type: string;
    name: string;
    outcome: SerialisedOutcome;
    duration: number;
    startedAt?: string;
    children: ActivityRecord[];
    location?: { path: string; line: number; column: number };
    error?: ErrorRecord;
    artifacts?: ArtifactReference[];
    restQuery?: RestQueryRecord;
    reportData?: ReportDataRecord[];
}

export interface RestQueryRecord {
    method: string;
    url: string;
    requestHeaders: string;
    requestBody?: string;
    statusCode: number;
    responseHeaders: string;
    responseBody?: string;
}

export interface ReportDataRecord {
    title: string;
    contents: string;
    contentType?: string;
}

export interface ErrorRecord {
    name: string;
    message: string;
    stack: string;
}

export interface TagRecord {
    type: string;
    name: string;
}

export interface AttemptRecord {
    attemptNumber: number;
    outcome: SerialisedOutcome;
    duration: number;
    activities: ActivityRecord[];
    error?: ErrorRecord;
    video?: string;
}

export interface ActorRecord {
    name: string;
    abilities: Array<{ name: string; details?: string }>;
}

export interface ArtifactReference {
    path: string;
    type: string;
    activityId?: string;
}
