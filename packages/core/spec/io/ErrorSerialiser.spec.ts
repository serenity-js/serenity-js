import 'mocha';

import { strictEqual } from 'assert';

import { AssertionError } from '../../src/errors';
import { ErrorSerialiser, parse } from '../../src/io';
import { expect } from '../expect';

describe ('ErrorSerialiser', () => {

    /** @test {ErrorSerialiser} */
    it('serialises an Error object to JSON', () => {
        const e = new Error(`Something happened`);

        expect(ErrorSerialiser.serialise(e)).to.equal(JSON.stringify({
            name: 'Error',
            stack: e.stack,
            message: 'Something happened',
        }));
    });

    /** @test {ErrorSerialiser} */
    it('deserialises a serialised Error object from JSON', () => {
        const stack = [
            'Error: Something happened',
            '    at /app/index.js:38:20',
            '    at Generator.next (<anonymous>)',
        ].join('\n');

        const error = ErrorSerialiser.deserialise(JSON.stringify({
            name: 'Error',
            message: 'Something happened',
            stack,
        }));

        expect(error).to.be.instanceOf(Error);
        expect(error.name).to.equal(`Error`);
        expect(error.message).to.equal(`Something happened`);
        expect(error.stack).to.equal(stack);
    });

    /** @test {ErrorSerialiser} */
    it('serialises a custom Error object to JSON', () => {
        const
            error = new AssertionError(`Expected false to equal true`, true, false),
            serialised = ErrorSerialiser.serialise(error);

        expect(parse(serialised).name).to.equal('AssertionError');
        expect(parse(serialised).message).to.equal('Expected false to equal true');
    });

    /** @test {ErrorSerialiser} */
    it('deserialises a serialised custom AssertionError object from JSON', () => {
        const stack = [
            'AssertionError: Expected false to equal true',
            '    at /app/index.js:38:20',
            '    at Generator.next (<anonymous>)',
        ].join('\n');

        const error = ErrorSerialiser.deserialise(JSON.stringify({
            name: 'AssertionError',
            message: 'Expected false to equal true',
            stack,
        }));

        expect(error).to.be.instanceOf(AssertionError);
        expect(error.name).to.equal(`AssertionError`);
        expect(error.message).to.equal(`Expected false to equal true`);
        expect(error.stack).to.equal(stack);
    });

    /** @test {ErrorSerialiser} */
    it('deserialises a serialised Node AssertionError object from JSON', () => {
        try {
            strictEqual(true, false);
        } catch (error_) {

            const error = ErrorSerialiser.deserialise(ErrorSerialiser.serialise(error_));

            expect(error).to.be.instanceOf(AssertionError);
            expect(error.name).to.equal(`AssertionError`);
            expect(error.message).to.match(/Expected.*strictly equal/);
        }
    });

    /** @test {ErrorSerialiser} */
    it('deserialises a serialised Node AssertionError object from stack trace', () => {
        try {
            strictEqual(true, false);
        } catch (error_) {

            const error = ErrorSerialiser.deserialiseFromStackTrace(error_.stack);

            expect(error).to.be.instanceOf(AssertionError);
            expect(error.name).to.equal(`AssertionError`);
            expect(error.message).to.match(/Expected.*strictly equal/);
        }
    });

    /** @test {ErrorSerialiser} */
    it('deserialises the error object from a stack trace alone (Cucumber event protocol)', () => {
        const stack = `Error: Something's wrong\n    at World.<anonymous> (features/step_definitions/synchronous.steps.ts:9:15)`;

        const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

        expect(error).to.be.instanceOf(Error);
        expect(error.name).to.equal(`Error`);
        expect(error.message).to.equal(`Something's wrong`);
        expect(error.stack).to.equal(stack);
    });

    /** @test {ErrorSerialiser} */
    it('deserialises the error object from a string (Cucumber event protocol)', () => {
        const stack = `function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`;

        const error: Error = ErrorSerialiser.deserialiseFromStackTrace(stack);

        expect(error).to.be.instanceOf(Error);
        expect(error.name).to.equal(`Error`);
        expect(error.message).to.equal(`function has 2 arguments, should have 3 (if synchronous or returning a promise) or 4 (if accepting a callback)`);
    });
});
