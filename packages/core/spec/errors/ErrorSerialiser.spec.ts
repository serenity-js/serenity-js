import { strictEqual } from 'assert';
import { describe, it } from 'mocha';

import { AssertionError, TimeoutExpiredError } from '../../src/errors';
import { ErrorSerialiser } from '../../src/errors';
import { expect } from '../expect';

const { format } = require('assertion-error-formatter');

describe ('ErrorSerialiser', () => {

    describe('when serialising errors to JSON', () => {

        it('works with Error objects', () => {
            const error = thrown(new Error(`Something happened`));

            expect(ErrorSerialiser.serialise(error)).to.equal(JSON.stringify({
                name:    'Error',
                stack:   error.stack,
                message: 'Something happened',
            }));
        });

        it('serialises all fields of custom objects that extend Error', () => {
            const error = thrown(new AssertionError(`Expected false to equal true`));

            const
                serialised  = ErrorSerialiser.serialise(error),
                parsed      = JSON.parse(serialised);

            expect(parsed.name).to.equal('AssertionError');
            expect(parsed.message).to.equal('Expected false to equal true');
            expect(parsed.stack).to.equal(error.stack);
        });

        it('serialises a TimeoutExpiredError', () => {
            const error     = thrown(new TimeoutExpiredError(`Interaction took longer than expected`));

            const
                serialised  = ErrorSerialiser.serialise(error),
                parsed      = JSON.parse(serialised);

            expect(parsed.name).to.equal('TimeoutExpiredError');
            expect(parsed.message).to.equal('Interaction took longer than expected');
            expect(parsed.stack).to.equal(error.stack);
        });

        it('serialises all fields of a Node.js AssertionError', () => {
            const error = caught(() => strictEqual(true, false));

            const
                serialised  = ErrorSerialiser.serialise(error),
                parsed      = JSON.parse(serialised);

            expect(parsed.name).to.equal('AssertionError');
            expect(parsed.message).to.equal('Expected values to be strictly equal:\n\ntrue !== false\n');
            expect(parsed.stack).to.equal(error.stack);
        });
    });

    describe('when deserialising errors from JSON', () => {

        it('deserialises an Error', () => {
            const stack = [
                'Error: Something happened',
                '    at /app/index.js:38:20',
                '    at Generator.next (<anonymous>)',
            ].join('\n');

            const error = ErrorSerialiser.deserialise(JSON.stringify({
                name:    'Error',
                message: 'Something happened',
                stack,
            }));

            expect(error).to.be.instanceOf(Error);
            expect(error.name).to.equal(`Error`);
            expect(error.message).to.equal(`Something happened`);
            expect(error.stack).to.equal(stack);
        });

        it('deserialises a custom AssertionError to Serenity/JS AssertionError, including all its fields', () => {
            const stack = [
                'AssertionError: Expected false to equal true',
                '    at /app/index.js:38:20',
                '    at Generator.next (<anonymous>)',
            ].join('\n');

            const error = ErrorSerialiser.deserialise(JSON.stringify({
                name:    'AssertionError',
                message: 'Expected false to equal true',
                stack,
            })) as AssertionError;

            expect(error).to.be.instanceOf(AssertionError);
            expect(error.name).to.equal(`AssertionError`);
            expect(error.message).to.equal(`Expected false to equal true`);
            expect(error.stack).to.equal(stack);
        });

        it('deserialises a serialised TimeoutExpiredError', () => {
            const cause     = thrown(new Error('root cause'));
            const error     = thrown(new TimeoutExpiredError(`Interaction took longer than expected`, cause));

            const serialised  = ErrorSerialiser.serialise(error);

            const deserialised = ErrorSerialiser.deserialise(serialised) as TimeoutExpiredError;

            expect(deserialised).to.be.instanceOf(TimeoutExpiredError);
            expect(deserialised.name).to.equal(`TimeoutExpiredError`);
            expect(deserialised.message).to.equal(`Interaction took longer than expected; root cause`);
            expect(deserialised.stack).to.equal(error.stack);
            expect(deserialised.cause.name).to.equal(cause.name);
            expect(deserialised.cause.message).to.equal(cause.message);
            expect(deserialised.cause.stack).to.equal(cause.stack);
        });

        it('deserialises Node.js AssertionError as Serenity/JS AssertionError', () => {
            const error = caught(() => strictEqual(true, false));

            const deserialised = ErrorSerialiser.deserialise(ErrorSerialiser.serialise(error)) as AssertionError;

            expect(deserialised).to.be.instanceOf(AssertionError);
            expect(deserialised.name).to.equal(`AssertionError`);
            expect(deserialised.message).to.match(/Expected.*strictly equal/);
        });
    });

    describe('when deserialising errors from stack trace', () => {

        it('works with standard Error objects (Cucumber event protocol)', () => {
            const stack = `Error: Something's wrong\n    at World.<anonymous> (features/step_definitions/synchronous.steps.ts:9:15)`;

            const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

            expect(error).to.be.instanceOf(Error);
            expect(error.name).to.equal(`Error`);
            expect(error.message).to.equal(`Something's wrong`);
            expect(error.stack).to.equal(stack);
        });

        it('instantiates an Error object from a string (Cucumber event protocol)', () => {
            const stack = `function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`;

            const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

            expect(error).to.be.instanceOf(Error);
            expect(error.name).to.equal(`Error`);
            expect(error.message).to.equal(`function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`);
        });

        it('instantiates a Serenity/JS AssertionError from an AssertionError-like stack trace, as well as it can', () => {
            const error = caught(() => strictEqual(true, false));

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(error.stack) as AssertionError;

            expect(deserialised).to.be.instanceOf(AssertionError);
            expect(deserialised.name).to.equal(`AssertionError`);
            expect(deserialised.message).to.match(/Expected.*strictly equal/);
        });
    });

    // Cucumber.js 7 Message Protocol emits pretty-printed stack traces - see https://github.com/cucumber/cucumber-js/issues/1453
    describe(`when deserialising a stack trace decorated by Cucumber's assertion-error-formatter`, () => {

        it('instantiates a standard Error', () => {

            const error = thrown(new Error('Boom'));

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message);

            expect(deserialised).to.be.instanceof(Error);
            expect(deserialised.message).to.equal(error.message);
            expect(deserialised.stack).to.equal(error.stack);
        });

        it('instantiates a Serenity/JS AssertionError based on Chai AssertionError, to the best of its ability', () => {

            const error = caught(() => expect(true).to.equal(false));

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message) as AssertionError;

            expect(deserialised).to.be.instanceof(AssertionError);
            expect(deserialised.message).to.equal(`+ expected - actual\n\n    -true\n    +false`);
        });

        it('instantiates a Serenity/JS AssertionError based on Node.js AssertionError, to the best of its ability', () => {

            const error = caught(() => strictEqual(false, true));

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message) as AssertionError;

            expect(deserialised).to.be.instanceof(AssertionError);
            expect(deserialised.message).to.equal(`[ERR_ASSERTION]: Expected values to be strictly equal:\n\nfalse !== true\n\n    + expected - actual\n\n    -false\n    +true`);
        });

        it('instantiates a Serenity/JS AssertionError, to the best of its ability', () => {

            const error = caught(() => { throw new AssertionError('Expected true to equal false')}) as AssertionError;

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message) as AssertionError;

            expect(deserialised).to.be.instanceof(AssertionError);
            expect(deserialised.message).to.equal(`Expected true to equal false`);
        });
    });
});

function thrown<T>(throwable: T): T {
    try {
        throw throwable;
    } catch (error) {
        return error;
    }
}

function caught(fn: () => void) {
    try {
        fn();
    } catch (error) {
        return error;
    }
}

