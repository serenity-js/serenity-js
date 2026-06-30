import type { SerialisedOutcome } from '@serenity-js/core/model';

import type { SystemContext } from '../SystemContextDetector.js';

/**
 * The data model for a single test run, serialised as db.json.
 *
 * @package
 */
export interface RunData {
    testRunId?: string;
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

export interface SceneRecord {
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
    retries?: number;
    attempts?: AttemptRecord[];
    cast?: ActorRecord[];
    narrative?: string;
    description?: string;
    artifacts?: ArtifactReference[];
    scenarioOutline?: {
        template: string;
        parameters: ScenarioParameterSet[];
    };
}

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
