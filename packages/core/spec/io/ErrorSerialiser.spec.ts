import 'mocha';

import { strictEqual } from 'assert';
const { format } = require('assertion-error-formatter');    // eslint-disable-line @typescript-eslint/no-var-requires

import { AssertionError } from '../../src/errors';
import { ErrorSerialiser, parse } from '../../src/io';
import { expect } from '../expect';

describe ('ErrorSerialiser', () => {

    describe('when serialising errors to JSON', () => {
        /** @test {ErrorSerialiser} */
        it('works with Error objects', () => {
            const error = thrown(new Error(`Something happened`));

            expect(ErrorSerialiser.serialise(error)).to.equal(JSON.stringify({
                name:    'Error',
                stack:   error.stack,
                message: 'Something happened',
            }));
        });

        /** @test {ErrorSerialiser} */
        it('serialises all fields of custom objects that extend Error', () => {
            const error = thrown(new AssertionError(`Expected false to equal true`, true, false));

            const
                serialised      = ErrorSerialiser.serialise(error),
                deserialised    = parse(serialised);

            expect(deserialised.name).to.equal('AssertionError');
            expect(deserialised.message).to.equal('Expected false to equal true');
            expect(deserialised.expected).to.equal(true);
            expect(deserialised.actual).to.equal(false);
            expect(deserialised.stack).to.equal(error.stack);
        });

        /** @test {ErrorSerialiser} */
        it('serialises all fields of a Node.js AssertionError', () => {
            const error = caught(() => strictEqual(true, false));

            const
                serialised      = ErrorSerialiser.serialise(error),
                deserialised    = parse(serialised);

            expect(deserialised.name).to.equal('AssertionError');
            expect(deserialised.message).to.equal('Expected values to be strictly equal:\n\ntrue !== false\n');
            expect(deserialised.expected).to.equal(false);
            expect(deserialised.actual).to.equal(true);
            expect(deserialised.stack).to.equal(error.stack);
        });
    });

    describe('when deserialising errors from JSON', () => {

        /** @test {ErrorSerialiser} */
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

        /** @test {ErrorSerialiser} */
        it('deserialises a custom AssertionError to Serenity/JS AssertionError, including all its fields', () => {
            const stack = [
                'AssertionError: Expected false to equal true',
                '    at /app/index.js:38:20',
                '    at Generator.next (<anonymous>)',
            ].join('\n');

            const error = ErrorSerialiser.deserialise(JSON.stringify({
                name:    'AssertionError',
                message: 'Expected false to equal true',
                expected: true,
                actual:   false,
                stack,
            })) as AssertionError;

            expect(error).to.be.instanceOf(AssertionError);
            expect(error.name).to.equal(`AssertionError`);
            expect(error.message).to.equal(`Expected false to equal true`);
            expect(error.expected).to.equal(true);
            expect(error.actual).to.equal(false);
            expect(error.stack).to.equal(stack);
        });

        /** @test {ErrorSerialiser} */
        it('deserialises Node.js AssertionError as Serenity/JS AssertionError', () => {
            const error = caught(() => strictEqual(true, false));

            const deserialised = ErrorSerialiser.deserialise(ErrorSerialiser.serialise(error)) as AssertionError;

            expect(deserialised).to.be.instanceOf(AssertionError);
            expect(deserialised.name).to.equal(`AssertionError`);
            expect(deserialised.message).to.match(/Expected.*strictly equal/);
            expect(deserialised.expected).to.equal(false);
            expect(deserialised.actual).to.equal(true);
        });
    });

    describe('when deserialising errors from stack trace', () => {

        /** @test {ErrorSerialiser} */
        it('works with standard Error objects (Cucumber event protocol)', () => {
            const stack = `Error: Something's wrong\n    at World.<anonymous> (features/step_definitions/synchronous.steps.ts:9:15)`;

            const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

            expect(error).to.be.instanceOf(Error);
            expect(error.name).to.equal(`Error`);
            expect(error.message).to.equal(`Something's wrong`);
            expect(error.stack).to.equal(stack);
        });

        /** @test {ErrorSerialiser} */
        it('instantiates an Error object from a string (Cucumber event protocol)', () => {
            const stack = `function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`;

            const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

            expect(error).to.be.instanceOf(Error);
            expect(error.name).to.equal(`Error`);
            expect(error.message).to.equal(`function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`);
        });

        /** @test {ErrorSerialiser} */
        it('instantiates a Serenity/JS AssertionError from an AssertionError-like stack trace, as well as it can', () => {
            const error = caught(() => strictEqual(true, false));

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(error.stack) as AssertionError;

            expect(deserialised).to.be.instanceOf(AssertionError);
            expect(deserialised.name).to.equal(`AssertionError`);
            expect(deserialised.message).to.match(/Expected.*strictly equal/);

            // todo: we have no way of knowing either of those two fields from the stack trace alone
            expect(deserialised.actual).to.equal(undefined);
            expect(deserialised.expected).to.equal(undefined);
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

            // todo: we have no way of knowing either of those two fields from the stack trace alone
            expect(deserialised.expected).to.equal(undefined);
            expect(deserialised.actual).to.equal(undefined);
        });

        it('instantiates a Serenity/JS AssertionError based on Node.js AssertionError, to the best of its ability', () => {

            const error = caught(() => strictEqual(false, true));

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message) as AssertionError;

            expect(deserialised).to.be.instanceof(AssertionError);
            expect(deserialised.message).to.equal(`[ERR_ASSERTION]: Expected values to be strictly equal:\n\nfalse !== true\n\n    + expected - actual\n\n    -false\n    +true`);

            // todo: we have no way of knowing either of those two fields from the stack trace alone
            expect(deserialised.expected).to.equal(undefined);
            expect(deserialised.actual).to.equal(undefined);
        });

        it('instantiates a Serenity/JS AssertionError, to the best of its ability', () => {

            const error = caught(() => { throw new AssertionError('Expected true to equal false', true, false)}) as AssertionError;

            const message = format(error);

            const deserialised = ErrorSerialiser.deserialiseFromStackTrace(message) as AssertionError;

            expect(deserialised).to.be.instanceof(AssertionError);
            expect(deserialised.message).to.equal(`Expected true to equal false\n    + expected - actual\n\n    -false\n    +true`);

            // todo: we have no way of knowing either of those two fields from the stack trace alone
            expect(deserialised.expected).to.equal(undefined);
            expect(deserialised.actual).to.equal(undefined);
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

