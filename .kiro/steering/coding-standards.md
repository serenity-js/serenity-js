# Serenity/JS Coding Standards

## TypeScript Configuration

Target ES2023 with CommonJS modules. Key compiler options:

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

### Indentation and Formatting

- 4-space indentation (enforced by ESLint)
- Single quotes for strings (template literals allowed)
- No trailing semicolons issues - semicolons are required
- Maximum one empty line between code blocks

### Import Organization

Imports are auto-sorted by `eslint-plugin-simple-import-sort`:

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

### Naming Conventions

- Files: kebab-case, PascalCase, or camelCase (all allowed)
- Test files: `*.spec.ts`
- Step definitions: `*.steps.ts`
- Classes: PascalCase
- Interfaces: PascalCase (no `I` prefix)
- Type aliases: PascalCase with `_Type` suffix for generics (e.g., `Answer_Type`)
- Constants: camelCase or SCREAMING_SNAKE_CASE

### Abbreviations Allowed

The ESLint unicorn plugin allows these abbreviations:

```
acc, arg, args, attrs, conf, doc, e, env, fn, i, params, pkg, 
prop, props, ref, refs, temp, wdio
```

## Documentation

### JSDoc Comments

All public APIs must have JSDoc documentation with:
- Description of purpose
- `@param` tags for parameters
- `@returns` description
- `@throws` for errors
- Links to related APIs using `{@link ClassName}` or full URLs

Example from the codebase:

```typescript
/**
 * **Actors** represent **people** and **external systems** interacting with the system under test.
 * Their role is to perform [activities](https://serenity-js.org/api/core/class/Activity/) 
 * that demonstrate how to accomplish a given goal.
 *
 * Learn more about:
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`Ability`](https://serenity-js.org/api/core/class/Ability/)
 *
 * @group Screenplay Pattern
 */
export class Actor implements PerformsActivities { }
```

### Code Examples in Docs

Include runnable examples in JSDoc:

```typescript
/**
 * ## Defining a task
 *
 * ```ts
 * import { Task, the } from '@serenity-js/core'
 * import { Click, Enter } from '@serenity-js/web'
 *
 * const SignIn = (username: string, password: string) =>
 *   Task.where(the`#actor signs in as ${ username }`,
 *     Enter.theValue(username).into(UsernameField),
 *     Enter.theValue(password).into(PasswordField),
 *     Click.on(SignInButton),
 *   );
 *
 */
```

## Error Handling

### Custom Error Classes

Extend from `RuntimeError` in `@serenity-js/core/errors`:

```typescript
import { RuntimeError } from '../errors';

export class ConfigurationError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ConfigurationError, message, cause);
    }
}
```

### Error Messages

- Be specific about what went wrong
- Include context (actor name, ability type, etc.)
- Suggest remediation when possible

```typescript
throw new ConfigurationError(
    `${ this.name } can ${ availableAbilities.join(', ') }. ` +
    `They can't, however, ${ abilityType.name } yet. ` +
    `Did you give them the ability to do so?`
);
```

## Async Patterns

### Promise-based APIs

All async operations return Promises. Use async/await:

```typescript
async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Answer_Type> {
    const value = await actor.answer(this.question);
    return this.transform(value);
}
```

### Sequential Activity Execution

Activities execute sequentially using reduce:

```typescript
attemptsTo(...activities: Activity[]): Promise<void> {
    return activities.reduce(
        (previous: Promise<void>, current: Activity) =>
            previous.then(() => this.perform(current)),
        Promise.resolve()
    );
}
```

## Exports

### Public API

Only export from `src/index.ts`. Use barrel exports:

```typescript
// src/index.ts
export * from './errors';
export * from './screenplay';
export { d, f, format } from './io';  // Selective exports
```

### Internal Code

Mark internal classes with `@package` JSDoc tag:

```typescript
/**
 * @package
 */
class DynamicallyGeneratedTask extends Task { }
```

## Backwards Compatibility

Serenity/JS prioritises non-breaking changes to make it easy for developers to keep up to date with the framework.

### Avoiding Breaking Changes

When modifying public APIs:

1. **Prefer additive changes** - Add new methods/properties rather than modifying existing ones
2. **Use optional parameters** - New parameters should have defaults
3. **Extend, don't modify** - Create new classes/functions rather than changing existing signatures

### Deprecation Process

If a breaking change is unavoidable:

1. **Keep the existing API** - Don't remove or modify it
2. **Mark as deprecated** - Use `@deprecated` JSDoc tag with migration guidance
3. **Introduce new API in parallel** - Users can migrate at their own pace
4. **Log deprecation warnings** - Help users discover deprecated usage

```typescript
/**
 * @deprecated Use {@link NewMethod} instead. Will be removed in v4.0.
 * 
 * ## Migration
 * 
 * Before:
 * ```typescript
 * actor.oldMethod(param);
 * ```
 * 
 * After:
 * ```typescript
 * actor.newMethod(param);
 * ```
 */
oldMethod(param: string): void {
    console.warn('oldMethod is deprecated, use newMethod instead');
    return this.newMethod(param);
}

/**
 * Improved version of oldMethod with better error handling.
 */
newMethod(param: string): void {
    // New implementation
}
```

### What Constitutes a Breaking Change

- Removing a public class, method, or property
- Changing method signatures (parameter types, return types)
- Changing default behavior that users rely on
- Renaming exports

### What Is NOT a Breaking Change

- Adding new optional parameters with defaults
- Adding new methods or properties
- Adding new classes or modules
- Fixing bugs (even if someone depended on buggy behavior)
- Performance improvements

