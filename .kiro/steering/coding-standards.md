# Serenity/JS Coding Standards

## Design Principles

### Value Objects and Domain Modelling

All domain concepts are modelled as immutable value objects using `tiny-types`. A value object:

- Validates its invariants at construction time via `ensure(...)`
- Never accepts `null` or `undefined`
- Provides `fromJSON()` for deserialization
- Is immutable (all fields `readonly`)

```typescript
import { ensure, isDefined, TinyType } from 'tiny-types';

export class Name extends TinyType {
    static fromJSON(v: string): Name {
        return new Name(v);
    }

    constructor(public readonly value: string) {
        super();
        ensure(this.constructor.name, value, isDefined());
    }
}
```

When introducing a new domain concept, model it as a value object rather than a primitive. Prefer `Name` over `string`, `Duration` over `number`, `Path` over `string`.

### The Good Citizen Rule

Serenity/JS code follows strict null-safety principles:

- **Never accept `undefined` or `null` as a parameter** — validate with `ensure(...)`
- **Never return `undefined` or `null`** — use the Null Object pattern, throw descriptively, or provide a guard method
- **Guard methods over optional returns** — prefer `has(id)` + `get(id)` over `find(id): T | undefined`
- **No optional domain event properties** — all fields are required at construction time

```typescript
// Wrong: returns undefined
function findUser(id: string): User | undefined { ... }

// Right: guard method + guaranteed return
function hasUser(id: string): boolean { ... }
function getUser(id: string): User { ... }  // throws if not found

// Wrong: optional parameter
constructor(private readonly version?: Version) { }

// Right: required parameter with validation
constructor(private readonly version: Version) {
    ensure('version', version, isDefined());
}
```

### Composition Over Inheritance

Favour delegation and composition:

```typescript
// Right: compose activities into a Task
const SignIn = (username: string, password: string) =>
    Task.where(the`#actor signs in as ${ username }`,
        Enter.theValue(username).into(UsernameField),
        Enter.theValue(password).into(PasswordField),
        Click.on(SignInButton),
    );

// Right: compose expectations algebraically
const isReady = and(isVisible(), isEnabled());

// Right: compose elements via meta-questions
const itemName = () => PageElement.located(By.css('.name')).describedAs('name');
const item = () => PageElement.located(By.css('.item')).describedAs('item');
const nameOfItem = itemName().of(item());
```

The only acceptable inheritance: abstract base classes defining contracts for dependency inversion (`BrowseTheWeb` → `BrowseTheWebWithPlaywright`).

## TypeScript Configuration

Target ES2023 with CommonJS modules:

```json
{
  "target": "es2023",
  "module": "CommonJS",
  "moduleResolution": "node",
  "declaration": true,
  "declarationMap": true,
  "sourceMap": true,
  "noImplicitReturns": true
}
```

Some packages (jasmine, webdriverio) also produce ESM builds with separate tsconfig files.

## Code Style

### Formatting

- 4-space indentation (enforced by ESLint)
- Single quotes (template literals allowed)
- Semicolons required
- Maximum one empty line between code blocks

### Import Organization

Auto-sorted by `eslint-plugin-simple-import-sort`:

```typescript
// External dependencies first
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

// Internal imports (relative paths)
import { Actor, Interaction } from '../../src/screenplay';
import { expect } from '../expect';
```

Use `@typescript-eslint/consistent-type-imports` for type-only imports:

```typescript
import type { AnswersQuestions, UsesAbilities } from './abilities';
import { Ability } from './abilities';
```

### Naming

- Classes: PascalCase
- Interfaces: PascalCase (no `I` prefix)
- Type aliases: PascalCase; generics use `_Type` suffix (e.g., `Answer_Type`)
- Files: kebab-case, PascalCase, or camelCase (all permitted)
- Test files: `*.spec.ts`
- Step definitions: `*.steps.ts`
- Constants: camelCase or SCREAMING_SNAKE_CASE

### Allowed Abbreviations

ESLint unicorn permits: `acc`, `arg`, `args`, `attrs`, `conf`, `doc`, `e`, `env`, `fn`, `i`, `params`, `pkg`, `prop`, `props`, `ref`, `refs`, `temp`, `utils`, `wdio`

## Async Patterns

All async operations return Promises. Use async/await:

```typescript
async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer_Type> {
    const value = await actor.answer(this.question);
    return this.transform(value);
}
```

Activities execute sequentially:

```typescript
attemptsTo(...activities: Activity[]): Promise<void> {
    return activities.reduce(
        (previous: Promise<void>, current: Activity) =>
            previous.then(() => this.perform(current)),
        Promise.resolve()
    );
}
```

## Error Handling

### Custom Errors

Extend `RuntimeError` from `@serenity-js/core/errors`:

```typescript
export class ConfigurationError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ConfigurationError, message, cause);
    }
}
```

### Error Messages

Be specific, include context, and suggest remediation:

```typescript
throw new ConfigurationError(
    `${ this.name } can ${ availableAbilities.join(', ') }. ` +
    `They can't, however, ${ abilityType.name } yet. ` +
    `Did you give them the ability to do so?`
);
```

## Documentation

### JSDoc

All public APIs require JSDoc with:
- Description of purpose and design intent
- `@param`, `@returns`, `@throws` tags
- Links to related APIs (`{@link ClassName}` or full URLs)
- Runnable code examples where helpful
- `@group` tag for Screenplay Pattern classification

```typescript
/**
 * **Actors** represent **people** and **external systems** interacting with the system under test.
 *
 * @group Screenplay Pattern
 */
export class Actor implements PerformsActivities { }
```

### Internal Code

Mark non-public classes with `@package`:

```typescript
/**
 * @package
 */
class DynamicallyGeneratedTask extends Task { }
```

## Exports and Package Boundaries

Only export from `src/index.ts` using barrel exports:

```typescript
export * from './errors';
export * from './screenplay';
export { d, f, format } from './io';  // Selective exports
```

Each package boundary is explicit. Internal code must not leak across packages.

## Backwards Compatibility

Serenity/JS prioritises non-breaking changes so developers can upgrade painlessly.

### Rules

- **Additive only** — new methods/properties, never removal or signature changes
- **Defaults for new parameters** — new optional parameters must have sensible defaults
- **Deprecate, don't delete** — mark with `@deprecated` JSDoc, log warnings, provide migration path in docs

```typescript
/**
 * @deprecated Use {@link newMethod} instead. Will be removed in v4.0.
 *
 * ## Migration
 * ```typescript
 * // Before
 * actor.oldMethod(param);
 * // After
 * actor.newMethod(param);
 * ```
 */
oldMethod(param: string): void {
    return this.newMethod(param);
}
```

### What Constitutes a Breaking Change

- Removing a public class, method, or property
- Changing method signatures (parameter types, return types)
- Changing default behaviour users rely on
- Renaming exports

### What Is NOT a Breaking Change

- Adding new optional parameters with defaults
- Adding new methods, properties, classes, or modules
- Bug fixes (even if someone depended on buggy behaviour)
- Performance improvements

## Type Precision

TypeScript types are documentation that the compiler enforces. Loose types (`any`, `Record<string, unknown>`, `unknown[]`) defer errors to runtime — treat them as technical debt from the moment they're written.

### Return types must be as specific as the implementation allows

```typescript
// Wrong: caller loses all structure
function buildOptions(): Record<string, unknown> { ... }

// Right: caller gets compile-time verification
function buildOptions(): ChartOptions { ... }
```

If a function constructs a well-shaped object, type the return to match. Never use `Record<string, unknown>` as a return type when the actual shape is known.

### Function parameters should accept the minimum required type

```typescript
// Wrong: demands the full interface but only uses .tags
function getBrowserTag(scenario: ReportScenario): string | undefined { ... }

// Right: accepts anything with the fields actually accessed
function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | undefined { ... }
```

This makes the function reusable across contexts without forcing callers to cast or provide unnecessary fields.

### Tie producers and consumers together generically

When one function produces data that another consumes, use a generic to enforce consistency at the definition site:

```typescript
// Wrong: view and data are typed independently — mismatch is a runtime error
interface RouteDefinition {
    view: (props: Record<string, unknown>) => ComponentChild;
    data: () => Record<string, unknown>;
}

// Right: generic ties data's output to view's input — mismatch is a compile error
interface RouteConfig<P> {
    view: (props: P) => ComponentChild;
    data: () => P;
}

function defineRoute<P>(config: RouteConfig<P>): RouteDefinition {
    return config as unknown as RouteDefinition;  // safe: generic already proved consistency
}
```

Use this pattern (builder function with generic inference) whenever a heterogeneous collection needs type-safe members that can't share a single concrete type parameter.

### Avoid `any` — use these alternatives

| Situation | Instead of `any` | Use |
|-----------|------------------|-----|
| Heterogeneous collection member | `as any` at registration | Generic builder function (see above) |
| Callback with varying params | `(...args: any[]) => any` | Minimal required type: `(event: Event) => void` |
| Third-party library mismatch | `value as any` | Import the library's own types |
| Object with dynamic keys | `Record<string, any>` | `Record<string, unknown>` + type narrowing |
| Test data factory | `Partial<T> & Record<string, unknown>` | `Partial<T>` — don't weaken for convenience |

The only acceptable `any` is inside a generic builder function body (where the generic already proved type safety) or in an eslint-disable-commented type alias with a JSDoc explaining why (e.g., framework interop).

### Fallback values must preserve the expected type

```typescript
// Wrong: TypeScript infers {} which has no properties
const runner = context.testRunner || {};
runner.name; // TS2339: Property 'name' does not exist on type '{}'

// Right: typed fallback preserves the interface
const runner = context.testRunner || { name: '', version: '' };
runner.name; // OK
```

### useEffect early returns require explicit `return undefined`

TypeScript's `noImplicitReturns` flag treats `return;` as inconsistent with `return () => cleanup()` in useEffect callbacks. Always use `return undefined;` for early exits:

```typescript
useEffect(() => {
    if (!shouldRun) return undefined;
    const handler = () => { ... };
    element.addEventListener('change', handler);
    return () => element.removeEventListener('change', handler);
}, [shouldRun]);
```

### Repeated inline expressions should be a named utility with a precise type

If the same expression appears 3+ times, extract it to a named function with a typed signature. The function name documents intent; the type prevents drift:

```typescript
// Wrong: same arithmetic inlined in 11 files
(outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0)

// Right: single typed utility
function totalFailedCount(outcomes: ReportOutcomes): number { ... }
```

### DOM lib configuration for browser code

When a tsconfig covers browser code that iterates DOM collections (`for...of` on `NodeListOf`, spreading `querySelectorAll` results), include `"dom.iterable"` alongside `"dom"` in the lib array:

```json
{ "lib": ["es2023", "dom", "dom.iterable"] }
```
