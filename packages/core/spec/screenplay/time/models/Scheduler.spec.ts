import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { Clock, Duration, OperationInterruptedError, Scheduler, TimeoutExpiredError } from '../../../../src';
import { expect } from '../../../expect';

describe('Scheduler', () => {

    const clock           = new Clock(() => new Date());
    const defaultTimeout  = Duration.ofSeconds(10);

    const delay           = Duration.ofMilliseconds(250);

    let scheduler: Scheduler;
    beforeEach(() => {
        scheduler = new Scheduler(clock, defaultTimeout);
    });
    afterEach(() => {
        scheduler.stop();
    });

    it('can be started and stopped', () => {
        expect(scheduler.isRunning()).to.equal(false);

        scheduler.start();
        expect(scheduler.isRunning()).to.equal(true);

        scheduler.stop();
        expect(scheduler.isRunning()).to.equal(false);
    });

    describe('when scheduling a delayed callback', () => {

        it('allows for a callback function to be called after a delay', async () => {
            scheduler.start();

            const instantiationTime = clock.now();
            const expectedInvocationTime = instantiationTime.plus(delay);

            const invocationTime = await scheduler.after(delay, ({ currentTime }) => {
                return currentTime;
            });

            expect(expectedInvocationTime.isBeforeOrEqual(invocationTime))
                .to.equal(true, `expected: ${ expectedInvocationTime }, actual: ${ invocationTime }`);
        });

        it('rejects the returned promise if the callback function throws an error', async () => {
            scheduler.start();

            const result = scheduler.after(delay, () => {
                throw new Error('scheduled function failed');
            });

            await expect(result).to.be.rejectedWith(Error, 'scheduled function failed');
        });

        it('allows for multiple callback functions to be called after a delay', async () => {
            const firstDelay    = Duration.ofMilliseconds(500);
            const secondDelay   = Duration.ofMilliseconds(250);

            const instantiationTime = clock.now();

            const expectedFirstInvocationTime   = instantiationTime.plus(firstDelay);
            const expectedSecondInvocationTime  = instantiationTime.plus(secondDelay);

            scheduler.start();

            const firstInvocationTime = await scheduler.after(firstDelay, ({ currentTime }) => {
                return currentTime;
            });

            const secondInvocationTime = await scheduler.after(secondDelay, ({ currentTime }) => {
                return currentTime;
            });

            expect(expectedFirstInvocationTime.isBeforeOrEqual(firstInvocationTime))
                .to.equal(true, `expected: ${ expectedFirstInvocationTime }, actual: ${ firstInvocationTime }`);

            expect(expectedSecondInvocationTime.isBeforeOrEqual(secondInvocationTime))
                .to.equal(true, `expected: ${ expectedSecondInvocationTime }, actual: ${ secondInvocationTime }`);
        });

        it('can be fast-forwarded for testing purposes', async () => {
            const longTime = Duration.ofMinutes(5);

            const callback = sinon.spy();

            const result = scheduler.after(longTime, callback);

            await scheduler.invokeCallbacksScheduledForNext(longTime);

            expect(callback).to.have.been.called;

            await expect(result).to.be.fulfilled;
        });
    });

    describe('when clearing callbacks', () => {

        it('stops the clock and clears any outstanding notifications', async () => {
            const delay = Duration.ofMinutes(1);

            const callback = sinon.spy();

            scheduler.start();

            const result = scheduler.after(delay, callback);

            scheduler.stop();

            await scheduler.invokeCallbacksScheduledForNext(delay);
            expect(callback).callCount(0);

            await expect(result).to.be.rejectedWith(OperationInterruptedError, /^Scheduler stopped before executing callback/);
        });
    });

    describe('when scheduling a repeated callback', () => {

        describe(`until the condition is met`, () => {

            it('executes the work item at least once', async () => {
                const callback = sinon.spy();
                const expected = 1;

                scheduler.start();

                const result = await scheduler.repeatUntil(
                    () => {
                        callback()
                        return expected;
                    },
                    {
                        exitCondition: result => result === 1
                    }
                );

                expect(callback).to.have.been.calledOnce;
                expect(result).to.equal(expected);
            });

            it(`executes the work item as many times as needed to meet the condition`, async () => {
                let callCount = 0;

                scheduler.start();

                await scheduler.repeatUntil(
                    () => ++ callCount,
                    {
                        exitCondition: (value) => value >= 2
                    }
                );

                expect(callCount).to.equal(2);
            });

            it(`stops when the maximum number of allowed repetitions is reached`, async () => {
                const callback = sinon.spy();

                scheduler.start();

                await scheduler.repeatUntil(
                    callback,
                    {
                        exitCondition: continueIndefinitely,
                        maxInvocations: 2,
                    }
                );

                expect(callback).to.have.been.calledTwice;
            });

            it(`doesn't start if the maximum number of invocations is 0`, async () => {
                const callback = sinon.spy();

                scheduler.start();

                await scheduler.repeatUntil(
                    callback,
                    {
                        exitCondition: continueIndefinitely,
                        maxInvocations: 0,
                    }
                );

                expect(callback).to.have.not.been.called;
            });

            it(`introduces delays between executions if required`, async () => {
                scheduler = new Scheduler(clock, defaultTimeout);

                scheduler.start();

                let callbackInvocationCount = 0;
                const customDelayFunction = sinon.stub().returns(Duration.ofSeconds(0));

                await scheduler.repeatUntil(
                    () => ++ callbackInvocationCount,
                    {
                        exitCondition: result => result >= 3,
                        delayBetweenInvocations: customDelayFunction,
                    }
                );

                expect(callbackInvocationCount).to.equal(3);
                expect(customDelayFunction).to.have.been.calledThrice;
                expect(customDelayFunction.firstCall).to.have.been.calledWith(0);
                expect(customDelayFunction.secondCall).to.have.been.calledWith(1);
                expect(customDelayFunction.thirdCall).to.have.been.calledWith(2);
            });
        });

        it(`stops the work if any unhandled errors occur in the callback`, async () => {

            scheduler.start();

            const result = scheduler.repeatUntil(
                () => { throw new Error('error in callback'); },
            );

            await expect(result).to.be.rejectedWith(Error, 'error in callback')
        });

        it(`stops the work if any unhandled errors occur in the condition`, async () => {
            scheduler.start();

            const result = scheduler.repeatUntil(
                doNothing,
                {
                    exitCondition: () => { throw new Error('error in test exit condition'); }
                },
            );

            await expect(result).to.be.rejectedWith(Error, 'error in test exit condition')
        });

        it(`doesn't start the work when the timeout expires before the first attempt`, async () => {

            const timeout = Duration.ofSeconds(0);

            scheduler.start();

            let callCount = 0;

            const result = scheduler.repeatUntil(
                () => ++ callCount,
                {
                    exitCondition: continueIndefinitely,
                    delayBetweenInvocations: () => delay,
                    timeout,
                },
            )

            expect(callCount).to.equal(0);

            await expect(result).to.be.rejectedWith(TimeoutExpiredError, `Timeout of ${ timeout } has expired`);
        });

        it(`stops the work when the timeout expires`, async () => {

            const twoDelays = delay.plus(delay);

            scheduler.start();

            let callCount = 0;

            const result = scheduler.repeatUntil(
                () => ++ callCount,
                {
                    exitCondition: continueIndefinitely,
                    delayBetweenInvocations: () => delay,
                    timeout: twoDelays,
                }
            )

            await scheduler.invokeCallbacksScheduledForNext(twoDelays);

            expect(callCount).to.equal(1);

            await expect(result).to.be.rejectedWith(TimeoutExpiredError, `Timeout of ${ twoDelays } has expired`);
        });
    });

    describe('when handling errors', () => {

        describe('uses the custom error handler to process an error that', () => {

            it('occurred in the callback function', async () => {

                scheduler.start();

                const expectedError = new Error('scheduled function failed');
                const spy = sinon.spy();

                const result = scheduler.repeatUntil(
                    () => { throw expectedError; },
                    {
                        errorHandler: error => {
                            spy(error);
                            throw error;
                        }
                    },
                );

                await expect(result).to.be.rejectedWith(Error, expectedError.message);

                expect(spy).to.have.been.calledWith(expectedError);
            });

            it('occurred in the exitCondition function', async () => {

                scheduler.start();

                const expectedError = new Error('exitCondition function failed');
                const spy = sinon.spy();

                const result = scheduler.repeatUntil(
                    doNothing,
                    {
                        exitCondition: () => {
                            throw expectedError;
                        },
                        errorHandler: error => {
                            spy(error);
                            throw error;
                        }
                    },
                );

                await expect(result).to.be.rejectedWith(Error, expectedError.message);

                expect(spy).to.have.been.calledWith(expectedError);
            });
        });

        it('continues repeating invocations if the error was handled by the error handler and remembers the last successful result', async () => {
            scheduler.start();

            const expectedError = new Error('scheduled function failed');
            const firstResult = 'first result';

            const callback = sinon.spy();
            const errorHandler = sinon.spy();

            const result = await scheduler.repeatUntil(
                ({ i }) => {
                    callback();
                    if (i === 0) {
                        return firstResult;
                    }

                    throw expectedError;
                },
                {
                    maxInvocations: 3,
                    errorHandler: (error, lastKnownResult) => {
                        errorHandler(error, lastKnownResult);
                        // don't rethrow the error, pretend it's handled
                    }
                },
            );

            expect(callback).to.have.been.calledThrice;

            expect(errorHandler).to.have.been.calledTwice;
            expect(errorHandler.firstCall).to.have.been.calledWith(expectedError, firstResult);
            expect(errorHandler.secondCall).to.have.been.calledWith(expectedError, firstResult);

            expect(result).to.equal(firstResult);
        });
    });
});

function continueIndefinitely() {
    return false;
}

function doNothing() {
    return;
}
