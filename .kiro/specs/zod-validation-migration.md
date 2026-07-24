# Replace Hand-Written Validation with Zod Schema

## Problem

`validateRunData` in `src/cli/model/validation.ts` is a hand-written validator with imperative `assertString`,
`assertObject`, `assertArray` calls. It duplicates the shape information already expressed in the `RunData` TypeScript
interface. When fields become optional (e.g., `finishedAt`, `testRunner`), the validation logic must be updated
separately — leading to drift and bugs (as seen when `testRunner` validation wasn't correctly relaxed).

Meanwhile, Zod is already a devDependency used for the `summary.json` schema. Moving it to a production dependency
and defining a `RunDataSchema` would provide a single source of truth with better error messages.

## Solution

1. Move `zod` from `devDependencies` to `dependencies` in `packages/html-reporter/package.json`
2. Define a `RunDataSchema` in `src/cli/model/RunDataSchema.ts` using Zod
3. Replace `validateRunData` with `RunDataSchema.parse()` (or `.safeParse()` for graceful error handling)
4. Remove `validation.ts` and its hand-written assertion functions
5. Update tests to verify Zod validation errors

## Schema Definition

```typescript
import { z } from 'zod';

const OutcomeCountsSchema = z.object({
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    pending: z.number().int().min(0),
    skipped: z.number().int().min(0),
    compromised: z.number().int().min(0),
    error: z.number().int().min(0),
});

const TagRecordSchema = z.object({
    type: z.string(),
    name: z.string(),
});

const TestRunnerSchema = z.object({
    name: z.string(),
    version: z.string(),
});

export const RunDataSchema = z.object({
    schemaVersion: z.number().int(),
    testRunId: z.string().optional(),
    attempt: z.number().int().min(1).optional(),
    startedAt: z.string(),
    finishedAt: z.string().optional(),
    outcomes: OutcomeCountsSchema,
    scenes: z.array(z.unknown()),      // Scenes have complex union types — validate structurally
    tags: z.array(TagRecordSchema),
    testRunner: TestRunnerSchema.optional(),
    systemContext: z.unknown().optional(),
    modules: z.array(z.object({
        moduleId: z.string(),
        startedAt: z.string(),
        finishedAt: z.string().optional(),
    })).optional(),
});
```

## Error Handling

Replace:
```typescript
throw new InvalidRunDataError(path, 'missing required field "startedAt"');
```

With Zod's structured errors wrapped in the existing `InvalidRunDataError`:
```typescript
const result = RunDataSchema.safeParse(raw);
if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new InvalidRunDataError(path, `${firstIssue.path.join('.')}: ${firstIssue.message}`);
}
```

Keep `IncompatibleSchemaError` for the schema version check (that's a semantic check, not a structural one).

## Backwards Compatibility

No breaking change — `validateRunData` is `@package` (internal). The function signature stays the same:
```typescript
export function validateRunData(raw: unknown, sourcePath: string): RunData
```

## Testing

Existing `validation.spec.ts` tests continue to work — they assert on error types and messages. The messages
will change slightly (Zod's format vs hand-written), so test assertions should check for `InvalidRunDataError`
type and relevant field names, not exact message strings.

## Bundle Impact

Zod 4 is ~13KB minified+gzipped. Since the html-reporter is a Node.js CLI tool (not bundled into the browser
report), the size impact is negligible for consumers.
