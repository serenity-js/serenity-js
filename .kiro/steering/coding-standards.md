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
