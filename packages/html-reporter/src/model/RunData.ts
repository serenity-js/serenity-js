/**
 * The data model for a single test run, serialised as db.json.
 *
 * @package
 */
export interface RunData {
    timestamp: string;
    duration: number;
    outcomes: OutcomeCounts;
    scenes: SceneRecord[];
    tags: TagRecord[];
    testRunner: string;
    testRunnerVersion: string;
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
    outcome: string;
    duration: number;
    startedAt: string;
    source: { path: string; line: number };
    tags: TagRecord[];
    activities: ActivityRecord[];
    error?: ErrorRecord;
    retries?: number;
    attempts?: AttemptRecord[];
    cast?: ActorRecord[];
    narrative?: string;
    artifacts?: ArtifactReference[];
}

export interface ActivityRecord {
    type: string;
    name: string;
    outcome: string;
    duration: number;
    children: ActivityRecord[];
    error?: ErrorRecord;
    artifacts?: ArtifactReference[];
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
    outcome: string;
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
