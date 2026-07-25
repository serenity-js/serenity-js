import { z } from 'zod';

/**
 * Zod schema for outcome counts — validates the required numeric fields.
 *
 * @package
 */
export const OutcomeCountsSchema = z.object({
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    pending: z.number().int().min(0),
    skipped: z.number().int().min(0),
    compromised: z.number().int().min(0),
    error: z.number().int().min(0),
});

/**
 * Zod schema for tag records.
 *
 * @package
 */
export const TagRecordSchema = z.object({
    type: z.string(),
    name: z.string(),
});

/**
 * Zod schema for test runner info.
 *
 * @package
 */
export const TestRunnerSchema = z.object({
    name: z.string(),
    version: z.string(),
});

/**
 * Zod schema for module records within a run.
 *
 * @package
 */
export const ModuleRecordSchema = z.object({
    moduleId: z.string(),
    startedAt: z.string(),
    finishedAt: z.string().optional(),
    outcome: z.enum(['passed', 'failed', 'incomplete']).optional(),
    outcomes: OutcomeCountsSchema.optional(),
});

/**
 * Zod schema for the RunData model.
 *
 * Validates the top-level structure of a db.json file. Scene records and system context
 * are treated as opaque `z.unknown()`:
 * - `scenes` has complex union types and the producer is trusted code
 * - `systemContext` contains `Version` TinyType which serialises to string in JSON but is
 *   typed as `Version` in the `RunData` interface — validating it deeply would require
 *   a separate "JSON shape" interface
 *
 * @package
 */
export const RunDataSchema = z.object({
    schemaVersion: z.number().int(),
    testRunId: z.string().optional(),
    moduleId: z.string().optional(),
    attempt: z.number().int().min(1).optional(),
    startedAt: z.string(),
    finishedAt: z.string().optional(),
    outcomes: OutcomeCountsSchema,
    scenes: z.array(z.unknown()),
    tags: z.array(TagRecordSchema),
    testRunner: TestRunnerSchema.optional(),
    systemContext: z.unknown(),
    modules: z.array(ModuleRecordSchema).optional(),
});
