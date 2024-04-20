import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { Clock, Duration, OperationInterruptedError, Scheduler, TimeoutExpiredError } from '../../../../src';
import { expect } from '../../../expect';

describe('Scheduler', () => {

    const defaultTimeout  = Duration.ofSeconds(10);
    const delay           = Duration.ofMilliseconds(250);

    let clock;
    let scheduler: Scheduler;

    beforeEach(() => {
        clock = new Clock(() => new Date());
        scheduler = new Scheduler(clock, defaultTimeout);
    });

    afterEach(() => {
        scheduler.stop();
    });

    it('can resolve a promise after a desired period', async () => {
        const longTime = Duration.ofMinutes(5);

        const result = scheduler.waitFor(longTime);

        clock.setAhead(longTime);
        await clock.tick();

        await expect(result).to.be.fulfilled;
    });

    describe('when scheduling a delayed callback', () => {

        it('allows for a callback function to be called after a delay', async () => {
            const instantiationTime = clock.now();
            const expectedInvocationTime = instantiationTime.plus(delay);

            const invocationTime = await scheduler.after(delay, ({ currentTime }) => {
                return currentTime;
            });

            expect(expectedInvocationTime.isBeforeOrEqual(invocationTime))
                .to.equal(true, `expected: ${ expectedInvocationTime }, to be before or equal: ${ invocationTime }`);
        });

        it('rejects the returned promise if the callback function throws an error', async () => {
            const result = scheduler.after(delay, () => {
                throw new Error('scheduled function failed');
            });

            await expect(result).to.be.rejectedWith(Error, 'scheduled function failed');
        });

        it('allows for multiple callback functions to be called after a delay', async () => {
            const firstDelay    = Duration.ofMilliseconds(500);
            const secondDelay  = Duration.ofMilliseconds(250);

            const instantiationTime = clock.now();

            const expectedFirstInvocationTime   = instantiationTime.plus(firstDelay);
            const expectedSecondInvocationTime  = instantiationTime.plus(secondDelay);

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

            clock.setAhead(longTime);
            await clock.tick();

            expect(callback).to.have.been.called;

            await expect(result).to.be.fulfilled;
        });
    });

    describe('when clearing callbacks', () => {

        it('stops the clock and clears any outstanding notifications', async () => {
            const delay = Duration.ofMinutes(1);

            const callback = sinon.spy();

            // required to work around the unhandled promise rejection in Mocha/Chai
            // https://github.com/mochajs/mocha/issues/2797
            let operationError: Error;
            const result = scheduler.after(delay, callback).catch(error => {
                operationError = error;
            });

            scheduler.stop();

            clock.setAhead(delay);
            await clock.tick();

            expect(callback).callCount(0);

            await expect(result).to.be.fulfilled;

            expect(operationError).to.be.instanceof(OperationInterruptedError)
            expect(operationError.message).to.match(/^Scheduler stopped before executing callback/)
        });
    });

    describe('when scheduling a repeated callback', () => {

        describe(`until the condition is met`, () => {

            it('executes the work item at least once', async () => {
                const callback = sinon.spy();
                const expected = 1;

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

            const result = scheduler.repeatUntil(
                () => { throw new Error('error in callback'); },
            );

            await expect(result).to.be.rejectedWith(Error, 'error in callback')
        });

        it(`stops the work if any unhandled errors occur in the condition`, async () => {
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

            const callback = sinon.spy();

            await expect(
                scheduler.repeatUntil(
                    callback,
                    {
                        exitCondition: continueIndefinitely,
                        delayBetweenInvocations: () => delay,
                        timeout,
                    },
                )
            ).to.be.rejectedWith(TimeoutExpiredError, `Timeout of ${ timeout } has expired`);

            expect(callback).to.not.have.been.called;
        });

        it(`stops the work when the timeout expires`, async () => {

            const delayAndAHalf = delay.plus(new Duration(delay.inMilliseconds() / 2));

            let callCount = 0;

            await expect(
                scheduler.repeatUntil(
                    () => ++ callCount,
                    {
                        exitCondition: continueIndefinitely,
                        delayBetweenInvocations: () => delay,
                        timeout: delayAndAHalf,
                    }
                )
            ).to.be.rejectedWith(TimeoutExpiredError, `Timeout of ${ delayAndAHalf } has expired`);

            expect(callCount).to.equal(1);
        });
    });

    describe('when handling errors', () => {

        describe('uses the custom error handler to process an error that', () => {

            it('occurred in the callback function', async () => {

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
