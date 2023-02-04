import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { TinyType } from 'tiny-types';

import {
    AssertionError,
    ConfigurationError,
    ErrorFactory,
    ExpectationDetails,
    ImplementationPendingError,
    ListItemNotFoundError,
    LogicError,
    TestCompromisedError,
    TimeoutExpiredError,
    Unanswered,
    UnknownError,
} from '../../src';
import { trimmed } from '../../src/io';
import { expect } from '../expect';

describe('ErrorFactory', () => {

    given([
        { description: 'ConfigurationError',            errorType: ConfigurationError },
        { description: 'AssertionError',                errorType: AssertionError },
        { description: 'ConfigurationError',            errorType: ConfigurationError },
        { description: 'ImplementationPendingError',    errorType: ImplementationPendingError },
        { description: 'ListItemNotFoundError',         errorType: ListItemNotFoundError },
        { description: 'LogicError',                    errorType: LogicError },
        { description: 'TestCompromisedError',          errorType: TestCompromisedError },
        { description: 'TimeoutExpiredError',           errorType: TimeoutExpiredError },
        { description: 'UnknownError',                  errorType: UnknownError },
    ]).
    it('instantiates a requested runtime error', ({ errorType }) => {
        const errors = new ErrorFactory();

        const message   = `Something went wrong`;
        const error     = errors.create(errorType, { message });

        expect(error).to.be.instanceOf(errorType);
        expect(error.message).to.equal(message);
    });

    it('adds information about the expectation used, if provided', () => {
        const errors = new ErrorFactory();

        const message   = `Assertion failed`;
        const error     = errors.create(AssertionError, {
            message,
            diff: { expected: 5, actual: 2 },
            expectation: ExpectationDetails.of('equals', 5)
        });

        expect(error.message).to.equal(trimmed`
            | Assertion failed
            |
            | Expectation: equals(5)
            |
            | Expected number: 5
            | Received number: 2
            |`);
    });

    given([
        { description: 'ConfigurationError',            errorType: ConfigurationError },
        { description: 'AssertionError',                errorType: AssertionError },
        { description: 'ConfigurationError',            errorType: ConfigurationError },
        { description: 'ImplementationPendingError',    errorType: ImplementationPendingError },
        { description: 'ListItemNotFoundError',         errorType: ListItemNotFoundError },
        { description: 'LogicError',                    errorType: LogicError },
        { description: 'TestCompromisedError',          errorType: TestCompromisedError },
        { description: 'TimeoutExpiredError',           errorType: TimeoutExpiredError },
        { description: 'UnknownError',                  errorType: UnknownError },
    ]).
    it('attaches a cause when one is provided', ({ errorType }) => {
        const errors = new ErrorFactory();

        const errorMessage = `Something went wrong`;
        const causeMessage = `Underlying cause`;
        const cause = new Error(causeMessage);

        const error = errors.create(errorType, { message: errorMessage, cause });

        expect(error).to.be.instanceOf(errorType);
        expect(error.message).to.equal(errorMessage);
        expect(error.cause).to.equal(cause);
        expect(error.stack).to.include(`${ errorType.name }: ${ errorMessage }`);
        expect(error.stack).to.include(`Caused by: Error: ${ causeMessage }`);
    });

    describe('when generating a diff', () => {

        describe('for primitive types', () => {

            given([ {
                description: 'boolean',
                expected: true,
                actual: false,
                expectedDiff: trimmed`
                    | Expected boolean: true
                    | Received boolean: false
                    |`
            }, {
                description: 'number',
                expected: 42,
                actual: 12,
                expectedDiff: trimmed`
                    | Expected number: 42
                    | Received number: 12
                    |`
            }, {
                description: 'type mismatch',
                expected: 'true',
                actual: true,
                expectedDiff: trimmed`
                    | Expected string:  true
                    | Received boolean: true
                    |`
            }, {
                description: 'pattern match',
                expected: /Hello/,
                actual: 'Hi',
                expectedDiff: trimmed`
                    | Expected RegExp: /Hello/
                    | Received string: Hi
                    |`
            } ]).
            it('shows expected and actual values and their types', ({ expected, actual, expectedDiff }) => {

                const errors = new ErrorFactory();

                const message = 'Example message';

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(message + '\n\n' + expectedDiff);
            });
        });

        describe('for complex types', () => {

            it(`shows the actual value (no diff) when the type of actual and expected differ`, () => {
                const errors = new ErrorFactory();

                const message   = 'Example message';
                const expected  = 'Alice';
                const actual    = { name: 'Alice', pets: [ 'dog', 'cat' ] };

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected string: Alice
                    | Received object
                    |
                    | {
                    |   name: 'Alice',
                    |   pets: [
                    |     'dog',
                    |     'cat'
                    |   ]
                    | }
                    |`
                );
            });

            it(`shows a diff of actual vs expected when both values are plain objects`, () => {
                const errors = new ErrorFactory();

                const message   = 'Example message';
                const expected  = { name: 'Alice', pets: [ 'dog', 'cat' ] };
                const actual    = { name: 'Marry', pets: [ 'little lamb' ] };

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected object  - 3
                    | Received object  + 2
                    |
                    |   {
                    | -   "name": "Alice",
                    | +   "name": "Marry",
                    |     "pets": [
                    | -     "dog",
                    | -     "cat"
                    | +     "little lamb"
                    |     ]
                    |   }
                    |`
                );
            });

            it(`shows a diff of actual vs expected when the both values are arrays`, () => {
                const errors = new ErrorFactory();

                const message   = 'Example message';
                const expected  = [ { name: 'Alice' }, { name: 'Bob' }, { name: 'Cindy' }, { name: 'Daisy' } ];
                const actual    = [ { name: 'Alice' }, { name: 'Bob' }, { name: 'Daisy' }, { name: 'Elsa' } ];

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Array  - 1
                    | Received Array  + 1
                    |
                    |   [
                    |     { name: 'Alice' }
                    |     { name: 'Bob' }
                    | -   { name: 'Cindy' }
                    |     { name: 'Daisy' }
                    | +   { name: 'Elsa' }
                    |   ]
                    |`
                );
            });

            it(`shows a diff of actual vs expected when both values are serialisable to JSON`, () => {
                const errors = new ErrorFactory();

                const message   = 'Example message';
                const expected  = new Person('Alice', 27);
                const actual    = new Person('Bob', 32);

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Person  - 2
                    | Received Person  + 2
                    |
                    |   {
                    | -   "age": 27,
                    | -   "name": "Alice"
                    | +   "age": 32,
                    | +   "name": "Bob"
                    |   }
                    |`
                );
            });

            it(`shows a diff of actual vs expected when both values are single-value TinyTypes`, () => {
                const errors = new ErrorFactory();

                const message   = 'Example message';
                const expected  = new Name('Alice');
                const actual    = new Name('Bob');

                const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Name  - 1
                    | Received Name  + 1
                    |
                    | - "Alice"
                    | + "Bob"
                    |`
                );
            });

            describe('when the value is Unanswered', () => {
                it('shows the actual value when expected is Unanswered', () => {
                    const errors = new ErrorFactory();

                    const message   = 'Example message';
                    const expected  = new Unanswered();
                    const actual    = new Name('Bob');

                    const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                    expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Unanswered
                    | Received Name
                    |
                    | Name {
                    |   value: 'Bob'
                    | }
                    |`);
                });

                it('shows the expected value when expected is Unanswered', () => {
                    const errors = new ErrorFactory();

                    const message   = 'Example message';
                    const expected  = new Name('Bob');
                    const actual    = new Unanswered();

                    const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                    expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Name
                    | Received Unanswered
                    |`);
                });

                it('shows no diff when both expected and actual are Unanswered', () => {
                    const errors = new ErrorFactory();

                    const message   = 'Example message';
                    const expected  = new Unanswered();
                    const actual    = new Unanswered();

                    const error = errors.create(AssertionError, { message, diff: { expected, actual } });

                    expect(error.message).to.equal(trimmed`
                    | ${message}
                    |
                    | Expected Unanswered
                    | Received Unanswered
                    |`);
                });
            });
        });
    });
});

class Person extends TinyType {
    constructor(public readonly name: string, public readonly age: number) {
        super();
    }
}

class Name extends TinyType {
    constructor(public readonly value: string) {
        super();
    }
}
