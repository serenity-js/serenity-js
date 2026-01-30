import { expect } from '@integration/testing-tools';
import { AssertionError, TestCompromisedError } from '@serenity-js/core';
import type {
    ProblemIndication} from '@serenity-js/core/lib/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending
} from '@serenity-js/core/lib/model';
import { strictEqual } from 'assert';
import { describe, it, Test } from 'mocha';

import { MochaOutcomeMapper } from '../../src/mappers';

describe('MochaTestMapper', () => {

    const mapper = new MochaOutcomeMapper();
    const someScenario = () => void 0;

    it('recognises passing tests', () => {

        const test = new Test('example', someScenario);
        test.state = 'passed';

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ExecutionSuccessful);
    });

    it('recognises pending tests', () => {

        const test = new Test('example', undefined);
        test.pending = true;

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ImplementationPending);
    });

    it('recognises skipped tests', () => {

        const test = new Test('example', someScenario);
        test.pending = true;

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ExecutionSkipped);
    });

    it('recognises compromised tests', () => {

        const error = new TestCompromisedError('DB is down');

        const test = new Test('example', someScenario);
        test.state = 'failed';
        test.err = error;

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ExecutionCompromised);
        expect((outcome as ProblemIndication).error).to.equal(error);
    });

    it('recognises tests that failed with a Serenity/JS AssertionError', () => {

        const error = new AssertionError('Expected false to be true');

        const test = new Test('example', someScenario);
        test.state = 'failed';
        test.err = error;

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ExecutionFailedWithAssertionError);
        expect((outcome as ProblemIndication).error).to.equal(error);
    });

    it('recognises tests that failed with a generic AssertionError', function () {

        try {
            strictEqual(false, true);

            this.fail()
        } catch (error) {
            const test = new Test('example', someScenario);
            test.state = 'failed';
            test.err = error;

            const outcome = mapper.outcomeOf(test);

            expect(outcome).to.be.instanceof(ExecutionFailedWithAssertionError);
            expect((outcome as ProblemIndication).error).to.equal(error);
        }
    });

    it('recognises tests that failed with an Error', () => {

        const error = new Error(`We're sorry, something happened`);

        const test = new Test('example', someScenario);
        test.state = 'failed';
        test.err = error;

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.be.instanceof(ExecutionFailedWithError);
        expect((outcome as ProblemIndication).error).to.equal(error);
    });

    describe('when working with retryable tests', () => {

        const errorThrownInTest = new Error(`Something happened`)

        it('ignores the failure as long as execution is going to be retried', () => {

            const test = new Test('has retries left', someScenario);
            test.err = undefined;           // retryable tests don't have the `err` property
            test.isPending = () => false;
            test.isPassed = () => false;
            test.isFailed = () => false;
            test.retries = () => 1;
            (test as any).currentRetry = () => 0;

            const outcome = mapper.outcomeOf(test, errorThrownInTest);

            expect(outcome).to.be.instanceof(ExecutionIgnored);
            expect((outcome as ProblemIndication).error.message).to.equal('Something happened');
        });

        describe('when there are no retries left', () => {
            it(`marks execution as failed if there's an error`, () => {

                const test = new Test('has no retries left', someScenario);
                test.err = undefined;           // retryable tests don't have the `err` property
                test.isPending = () => false;
                test.isPassed = () => false;
                test.isFailed = () => false;
                test.retries = () => 1;
                (test as any).currentRetry = () => 1;

                const outcome = mapper.outcomeOf(test, errorThrownInTest);

                expect(outcome).to.be.instanceof(ExecutionFailedWithError);
                expect((outcome as ProblemIndication).error.message).to.equal('Something happened');
            });

            it(`marks execution as successful if there are no errors`, () => {

                const noError = undefined;

                const test = new Test('has no retries left', someScenario);
                test.err = undefined;           // retryable tests don't have the `err` property
                test.isPending = () => false;
                test.isPassed = () => false;
                test.isFailed = () => false;
                test.retries = () => 1;
                (test as any).currentRetry = () => 1;

                const outcome = mapper.outcomeOf(test, noError);

                expect(outcome).to.be.instanceof(ExecutionSuccessful);
            });
        });
    });
});
