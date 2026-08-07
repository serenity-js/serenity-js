# Serenity/JS Testing Patterns

## Philosophy

Tests are executable specifications. They describe **what the system does**, not how it's implemented. A good test reads as a behaviour description that remains valid even when the implementation changes.

### Naming Tests as Behaviours

Tests describe outcomes, not method calls:

```typescript
// Wrong: names the method
it('calls dial() on the phone service', () => { ... });

// Right: describes the behaviour
it('dials the given phone number', () => { ... });

// Right: describes a constraint
it('complains when the actor lacks the required ability', () => { ... });

// Right: describes a domain outcome
it('emits an InteractionFinished event upon completion', () => { ... });
```

### Signal Over Noise

Each test should assert one behavioural outcome. If a test needs extensive setup, that's often a sign the subject under test has too many responsibilities.

## Test Framework

Unit tests use Mocha + Chai + Sinon. Parameterised tests use `mocha-testdata`.

### Test File Structure

```typescript
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { expect } from '../expect';  // Local Chai configuration

describe('ClassName', () => {

    let dependency: sinon.SinonStubbedInstance<Dependency>;

    beforeEach(() => {
        dependency = sinon.createStubInstance(Dependency);
    });

    describe('when performing some behaviour', () => {

        it('produces the expected outcome', () => {
            const subject = new ClassName(dependency);

            const result = subject.doSomething();

            expect(result).to.equal(expected);
        });

        it('handles the edge case', () => {
            // ...
        });
    });
});
```

### Parameterised Tests (Specification by Example)

Use `mocha-testdata` when a behaviour should hold for multiple inputs:

```typescript
import { given } from 'mocha-testdata';

given([
    { description: 'undefined', value: undefined, expected: 'undefined' },
    { description: 'null',      value: null,      expected: 'null'      },
    { description: 'object',    value: { },       expected: 'object'    },
]).
it('describes the value as its type', ({ value, expected }) => {
    expect(format(value)).to.equal(expected);
});
```

This is the closest equivalent to Gherkin `Examples:` tables in unit tests. Use it whenever a behaviour should be demonstrated across a range of inputs.

### Async Patterns

```typescript
it('resolves with the expected value', async () => {
    const result = await actor.answer(question);
    expect(result).to.equal(expected);
});

it('rejects with a descriptive error', () => {
    return expect(actor.attemptsTo(failingTask))
        .to.be.rejectedWith(ConfigurationError, 'expected message');
});
```

### Sinon Patterns

```typescript
// Stub collaborators
const stage = sinon.createStubInstance(Stage);
stage.currentTime.returns(new Timestamp(new Date()));
stage.announce.resolves();

// Verify domain events were emitted
expect(stage.announce).to.have.been.calledWith(
    sinon.match.instanceOf(InteractionStarts)
);
expect(stage.announce.getCall(0).args[0]).to.be.instanceOf(InteractionStarts);
```

## Test Organization

### Unit Tests (`packages/*/spec/`)

Mirror the `src/` directory structure:

```
packages/core/
├── src/
│   ├── screenplay/
│   │   ├── Actor.ts
│   │   └── Question.ts
│   └── errors/
│       └── RuntimeError.ts
└── spec/
    ├── screenplay/
    │   ├── Actor.spec.ts
    │   └── Question.spec.ts
    └── errors/
        └── RuntimeError.spec.ts
```

### Integration Tests (`integration/`)

Each module tests a specific runner or browser combination:

```
integration/
├── playwright-test/     # Playwright Test runner adapter
├── playwright-web/      # Playwright web interactions
├── cucumber-12/         # Cucumber v12.x
├── webdriverio-*/       # WebdriverIO combinations
└── testing-tools/       # Shared test utilities (EventRecorder, PickEvent)
```

### Shared Test Utilities

`integration/testing-tools/` provides:
- `EventRecorder` — captures domain events for assertions
- `PickEvent` — fluent API for selecting and asserting on specific events
- Shared fixtures and helpers

## Testing Screenplay Pattern Components

### Testing an Interaction

Verify that the interaction delegates to the ability correctly:

```typescript
describe('Click', () => {

    let actor: Actor;
    let page: sinon.SinonStubbedInstance<Page>;

    beforeEach(() => {
        page = sinon.createStubInstance(Page);
        actor = Actor.named('Tester').whoCan(BrowseTheWeb.using(page));
    });

    it('clicks on a page element', async () => {
        const button = PageElement.located(By.css('.submit'));

        await actor.attemptsTo(Click.on(button));

        expect(page.click).to.have.been.calledOnce;
    });
});
```

### Testing a Question

Verify that the question retrieves the correct information:

```typescript
describe('Text', () => {

    it('retrieves text content of an element', async () => {
        const element = stubElement({ textContent: 'Hello World' });
        const actor = actorWithElement(element);

        const result = await actor.answer(Text.of(element));

        expect(result).to.equal('Hello World');
    });
});
```

### Testing Error Conditions

Verify that errors are descriptive and guide the developer:

```typescript
it('complains when the required ability is missing', () => {
    const actor = Actor.named('Ben');  // No abilities

    return expect(actor.attemptsTo(Click.on(button)))
        .to.be.rejectedWith(
            ConfigurationError,
            /Ben can't.*BrowseTheWeb.*Did you give them the ability/
        );
});
```

### Testing Domain Events

Verify that the correct events flow through the system:

```typescript
it('emits InteractionStarts and InteractionFinished events', async () => {
    await actor.attemptsTo(Click.on(button));

    expect(stage.announce).to.have.callCount(2);
    expect(stage.announce.getCall(0).args[0]).to.be.instanceOf(InteractionStarts);
    expect(stage.announce.getCall(1).args[0]).to.be.instanceOf(InteractionFinished);
});
```

## Coverage

Coverage via c8, configured in `.c8rc.json`:

```json
{
  "all": true,
  "include": ["src/**/*.ts"],
  "exclude": ["spec/**", "lib/**"],
  "reporter": ["text", "lcov"],
  "report-dir": "target/coverage"
}
```

Reports go to `packages/*/target/coverage/`.

## What Makes a Good Test

- **Describes behaviour** — "dials the phone number", not "calls dial()"
- **Is deterministic** — no flakiness, no race conditions, no reliance on timing
- **Fails for the right reason** — when the behaviour breaks, not when the implementation changes
- **Is self-contained** — setup is visible; no hidden shared state
- **Uses the domain vocabulary** — Actors, Abilities, Tasks, Questions, domain events
