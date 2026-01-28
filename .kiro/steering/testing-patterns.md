# Serenity/JS Testing Patterns

## Test Framework

Unit tests use Mocha with Chai assertions and Sinon for mocking.

### Test File Structure

```typescript
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { expect } from '../expect';  // Local chai configuration

describe('ClassName', () => {

    let dependency: sinon.SinonStubbedInstance<Dependency>;

    beforeEach(() => {
        dependency = sinon.createStubInstance(Dependency);
    });

    describe('methodName', () => {

        it('describes expected behavior', () => {
            // Arrange
            const subject = new ClassName(dependency);

            // Act
            const result = subject.methodName();

            // Assert
            expect(result).to.equal(expected);
        });

        it('handles edge case', () => {
            // ...
        });
    });
});
```

### Parameterized Tests

Use `mocha-testdata` for data-driven tests:

```typescript
import { given } from 'mocha-testdata';

given([
    { description: 'undefined', value: undefined, expected: 'undefined' },
    { description: 'null',      value: null,      expected: 'null'      },
    { description: 'object',    value: { },       expected: 'object'    },
]).
it('handles various input types', ({ value, expected }) => {
    expect(format(value)).to.equal(expected);
});
```

### Async Test Patterns

Return promises or use async/await:

```typescript
it('resolves async operations', async () => {
    const result = await actor.answer(question);
    expect(result).to.equal(expected);
});

it('rejects with specific error', () => {
    return expect(actor.attemptsTo(failingTask))
        .to.be.rejectedWith(ConfigurationError, 'expected message');
});

it('chains promise assertions', () => {
    return expect(asyncOperation()).to.be.fulfilled
        .then(result => {
            expect(result).to.have.property('name');
        });
});
```

### Sinon Patterns

```typescript
// Stub instance methods
const stage = sinon.createStubInstance(Stage);
stage.currentTime.returns(new Timestamp(new Date()));
stage.announce.resolves();

// Verify calls
expect(stage.announce).to.have.been.calledWith(sinon.match.instanceOf(Event));
expect(stage.announce).to.have.callCount(2);
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

Each integration module tests a specific test runner combination:

```
integration/
├── cucumber-1/          # Cucumber v1.x
├── cucumber-12/         # Cucumber v12.x (latest)
├── playwright-test/     # Playwright Test runner
├── playwright-web/      # Playwright web interactions
├── webdriverio-8-*/     # WebdriverIO v8 combinations
├── webdriverio-*/       # WebdriverIO v9+ combinations
└── testing-tools/       # Shared test utilities
```

### Shared Test Utilities

`integration/testing-tools/` provides:
- `EventRecorder` - Captures domain events for assertions
- `PickEvent` - Fluent API for event assertions
- Test fixtures and helpers

## Coverage

Coverage is collected via c8 with configuration in `.c8rc.json`:

```json
{
  "all": true,
  "include": ["src/**/*.ts"],
  "exclude": ["spec/**", "lib/**"],
  "reporter": ["text", "lcov"],
  "report-dir": "target/coverage"
}
```

Coverage reports go to `packages/*/target/coverage/`.

## Example Test Implementations

### Testing an Interaction

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

```typescript
it('complains when ability is missing', () => {
    const actor = Actor.named('Ben');  // No abilities

    return expect(actor.attemptsTo(Click.on(button)))
        .to.be.rejectedWith(
            ConfigurationError,
            /Ben can't.*BrowseTheWeb.*Did you give them the ability/
        );
});
```
