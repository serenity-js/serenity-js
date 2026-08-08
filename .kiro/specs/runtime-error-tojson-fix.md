# RuntimeError.toJSON Circular Reference Protection

## Status: DEFERRED — workaround in place

The html-reporter's `outcomeSerialisers.ts` avoids calling `outcome.toJSON()` entirely via `serialiseOutcome()`.
The proper fix (Option A) is tracked here for future implementation in `@serenity-js/core`.

## Problem

`RuntimeError.toJSON()` delegates to `TinyType.prototype.toJSON.apply(this)`, which recursively serialises ALL own
properties of the error instance. External libraries (notably Mocha) attach additional properties to error objects
that can create circular references:

```javascript
// Mocha's base reporter (lib/reporters/base.js:395)
test.err.multiple = (test.err.multiple || []).concat(err);
```

When a test and its `afterEach` hook both fail, Mocha sets `error.multiple = [error]` — a direct self-reference.
`TinyType.toJSON()` encounters this array, maps its elements, finds the error again, calls `toJSON()` on it →
infinite recursion → `RangeError: Maximum call stack size exceeded`.

## Affected Components

- `RuntimeError.toJSON()` in `packages/core/src/errors/model/RuntimeError.ts`
- Any consumer that calls `outcome.toJSON()` on a `ProblemIndication` (which calls `ErrorSerialiser.serialise(this.error)`)
- `ErrorSerialiser.serialise()` calls `error.toJSON()` when `isSerialisable(error)` is true

## Current Workaround

The html-reporter's `SceneRecordBuilder` avoids calling `outcome.toJSON()` entirely via `serialiseOutcome()`,
which returns `{ code }` using static Code constants. Error details are extracted separately via `errorFrom()`
which only reads `name`, `message`, `stack` as plain strings.

## Proposed Fix

### Option A: Override toJSON in RuntimeError to exclude non-standard properties

```typescript
// RuntimeError.ts
toJSON(): object {
    const { cause, message, name, stack } = this;
    return {
        name,
        message,
        stack,
        ...(cause ? { cause: this.serialiseCause(cause) } : {}),
    };
}

private serialiseCause(cause: Error): object {
    return {
        name: cause.name,
        message: cause.message,
        stack: cause.stack || '',
    };
}
```

Only serialise known, safe properties. External properties like `multiple` are excluded. This is the approach
the Serenity BDD reporter already uses (via `errorReportFrom`).

### Option B: Add circular reference detection to TinyType.toJSON call

```typescript
// RuntimeError.ts
toJSON(): object {
    const seen = new WeakSet();
    return this.safeToJSON(seen);
}

private safeToJSON(seen: WeakSet<object>): object {
    if (seen.has(this)) return { name: this.name, message: this.message };
    seen.add(this);
    // ... serialise properties, passing `seen` to recursive calls
}
```

More complex but handles arbitrary circular structures, not just `multiple`.

### Option C: Filter own properties in RuntimeError.toJSON

```typescript
// RuntimeError.ts
private static readonly SERIALISABLE_PROPERTIES = ['name', 'message', 'stack', 'cause'];

toJSON(): object {
    return Object.getOwnPropertyNames(this)
        .filter(key => RuntimeError.SERIALISABLE_PROPERTIES.includes(key))
        .reduce((json, key) => {
            json[key] = this[key] instanceof Error
                ? { name: this[key].name, message: this[key].message, stack: this[key].stack }
                : this[key];
            return json;
        }, {} as Record<string, unknown>);
}
```

Explicit allowlist — only serialises properties that RuntimeError knows about. External additions are ignored.

## Recommendation

**Option A** — explicit serialisation of known fields. It's simple, predictable, matches what `errorReportFrom`
already does in the Serenity BDD reporter, and doesn't break deserialisation (which expects `name`, `message`,
`stack`, and optionally `cause`).

The key insight: `RuntimeError.toJSON()` should NOT use `TinyType.prototype.toJSON.apply(this)` because error
objects are not pure value objects — they accumulate runtime properties from test frameworks, stack trace
processors, and other tooling. Treating them as TinyTypes (where all properties are significant) is incorrect.

## Testing

- Verify serialisation of a simple `AssertionError` still produces `{ name, message, stack }`
- Verify serialisation of `AssertionError` with a `cause` includes the cause's `{ name, message, stack }`
- Verify serialisation of an error with `error.multiple = [error]` (Mocha pattern) does NOT stack overflow
- Verify `ErrorSerialiser.serialise` round-trips correctly (serialise → deserialise → same error)
- Verify existing integration tests still pass (the serialised format must remain compatible with `fromJSON`)

## Backwards Compatibility

The serialised output may change slightly (previously included all own properties; now only known ones).
`fromJSON` implementations on `RuntimeError` subclasses expect `{ name, message, stack, cause? }` — so the
new output matches what deserialisers expect. No breaking change.

## Related

- Mocha source: `node_modules/mocha/lib/reporters/base.js:395` — sets `error.multiple`
- html-reporter workaround: `packages/html-reporter/src/cli/SceneRecordBuilder.ts` — `serialiseOutcome()`
- Serenity BDD reporter: `packages/serenity-bdd/src/.../mappers/errorReportFrom.ts` — correct pattern
