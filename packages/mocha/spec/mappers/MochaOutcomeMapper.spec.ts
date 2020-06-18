import 'mocha';

import { expect } from '@integration/testing-tools';
import { AssertionError, TestCompromisedError } from '@serenity-js/core';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    ProblemIndication,
} from '@serenity-js/core/lib/model';
import { strictEqual } from 'assert';
import { Test } from 'mocha'; // tslint:disable-line:no-duplicate-imports
import { MochaOutcomeMapper } from '../../src/mappers';

describe('MochaTestMapper', () => {

    const mapper = new MochaOutcomeMapper();
    const someScenario = () => void 0;

    it('recognises passing tests', () => {

        const test = new Test('example', someScenario);
        this.state = 'passed';

        const outcome = mapper.outcomeOf(test);

        expect(outcome).to.equal(new ExecutionSuccessful());
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

        const error = new AssertionError('Expected false to be true', true, false);

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

        it('recognises the first failure (singular)', () => {

            const test = new Test('example', someScenario);
            test.isPending = () => false;
            test.isPassed = () => false;
            test.isFailed = () => false;
            test.retries = () => 1;
            (test as any).currentRetry = () => 0;

            const outcome = mapper.outcomeOf(test);

            expect(outcome).to.be.instanceof(ExecutionFailedWithError);
            expect((outcome as ProblemIndication).error.message).to.equal('Execution failed, 1 retry left.');
        });

        it('recognises the first failure (plural)', () => {

            const test = new Test('example', someScenario);
            test.isPending = () => false;
            test.isPassed = () => false;
            test.isFailed = () => false;
            test.retries = () => 2;
            (test as any).currentRetry = () => 0;

            const outcome = mapper.outcomeOf(test);

            expect(outcome).to.be.instanceof(ExecutionFailedWithError);
            expect((outcome as ProblemIndication).error.message).to.equal('Execution failed, 2 retries left.');
        });

        it('recognises a failed retry attempt', () => {

            const test = new Test('example', someScenario);
            test.isPending = () => false;
            test.isPassed = () => false;
            test.isFailed = () => false;
            test.retries = () => 2;
            (test as any).currentRetry = () => 1;

            const outcome = mapper.outcomeOf(test);

            expect(outcome).to.be.instanceof(ExecutionFailedWithError);
            expect((outcome as ProblemIndication).error.message).to.equal('Retry 1 of 2 failed.');
        });
    });
});
