import { OperationInterruptedError, TimeoutExpiredError } from '../../../errors';
import { Clock } from './Clock';
import { DelayedCallback } from './DelayedCallback';
import { Duration } from './Duration';
import { RepeatUntilLimits } from './RepeatUntilLimits';
import { Timestamp } from './Timestamp';

/**
 * @group Time
 */
export class Scheduler {

    private remainingCallbacks: Map<DelayedCallback<unknown>, CallbackInfo<unknown>> = new Map();
    private completedCallbacks: Map<DelayedCallback<unknown>, CallbackInfo<unknown>> = new Map();
    private failedCallbacks:    Map<DelayedCallback<unknown>, CallbackInfo<unknown>> = new Map();

    private timer: NodeJS.Timer;

    /**
     * @param clock
     * @param interactionTimeout
     *  The maximum amount of time to give to a callback to complete before throwing an error
     */
    constructor(
        private readonly clock: Clock,
        private readonly interactionTimeout: Duration,
    ) {
    }

    /**
     * Schedules a callback function to be invoked after a delay
     *
     * @param delay
     * @param callback
     */
    after<Result>(delay: Duration, callback: DelayedCallback<Result>): Promise<Result> {
        return this.repeatUntil<Result>(
            callback,
            {
                maxInvocations: 1,
                delayBetweenInvocations: () => delay,
                timeout: this.interactionTimeout,
            },
        );
    }

    /**
     * Schedules a callback function to be repeated, according to configured limits.
     *
     * @param callback
     * @param limits
     */
    async repeatUntil<Result>(
        callback: DelayedCallback<Result>,
        limits: RepeatUntilLimits<Result> = {},
    ): Promise<Result> {

        const {
            maxInvocations          = Number.POSITIVE_INFINITY,
            delayBetweenInvocations = noDelay,
            timeout                 = this.interactionTimeout,
            exitCondition           = noEarlyExit,
            errorHandler            = rethrowErrors,
        } = limits;

        this.remainingCallbacks.set(callback, {
            exitCondition: exitCondition,
            currentInvocation: 0,
            invocationsLeft: maxInvocations,
            delayBetweenInvocations,
            startedAt: this.clock.now(),
            timeout,
            errorHandler,
            result: undefined,
        });

        return this.receiptFor<Result>(callback);
    }

    start(): void {
        if (! this.timer) {
            this.timer = setInterval(
                () =>  this.invokeCallbacksScheduledUntil(this.clock.now()),
                100
            )
        }
    }

    isRunning(): boolean {
        return Boolean(this.timer);
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;

            for (const [callback, info] of this.remainingCallbacks) {
                this.remainingCallbacks.delete(callback);
                this.failedCallbacks.set(callback, {
                    ...info,
                    error: new OperationInterruptedError(`Scheduler stopped before executing callback ${ callback }`)
                });
            }
        }
    }

    invokeCallbacksScheduledForNext(duration: Duration): void {
        this.invokeCallbacksScheduledUntil(
            this.clock.now().plus(duration)
        );
    }

    private invokeCallbacksScheduledUntil(timestamp: Timestamp): void {
        for (const [ callback, info ] of this.remainingCallbacks) {
            const { startedAt, currentInvocation, delayBetweenInvocations } = info;
            const expectedInvocationTime = startedAt.plus(delayBetweenInvocations(currentInvocation));

            if (expectedInvocationTime.isBeforeOrEqual(timestamp)) {
                this.invoke(callback);
            }
        }
    }

    private invoke<Result>(callback: DelayedCallback<Result>): void {
        const info = this.remainingCallbacks.get(callback);

        this.remainingCallbacks.delete(callback);

        Promise.resolve()
            .then(async () => {
                const timeoutExpired = info.startedAt.plus(info.timeout).isBefore(this.clock.now());
                const isLastInvocation = info.invocationsLeft === 1;

                if (info.invocationsLeft === 0) {
                    return {
                        hasCompleted: true,
                    };
                }

                try {
                    if (timeoutExpired) {
                        throw new TimeoutExpiredError(`Timeout of ${ info.timeout } has expired`);
                    }

                    const result = await callback({ currentTime: this.clock.now(), i: info.currentInvocation });

                    return {
                        result,
                        hasCompleted: info.exitCondition(result) || isLastInvocation,
                    }
                }
                catch(error) {
                    info.errorHandler(error, info.result);

                    // if the errorHandler didn't throw, it's a recoverable error
                    return {
                        error,
                        hasCompleted: isLastInvocation,
                    }
                }
            })
            .then(({ result, error, hasCompleted }) => {
                if (hasCompleted) {
                    this['completedCallbacks'].set(callback, {
                        ...info,
                        result: result ?? info.result,
                        error,
                    });
                }
                else {
                    this['remainingCallbacks'].set(callback, {
                        ...info,
                        currentInvocation:  info.currentInvocation + 1,
                        invocationsLeft:    info.invocationsLeft - 1,
                        result: result ?? info.result,
                        error,
                    });
                }
            })
            .catch(error => {
                this.failedCallbacks.set(callback, { ...info, error });
            });
    }

    private receiptFor<Result>(callback: DelayedCallback<unknown>): Promise<Result> {
        return new Promise((resolve, reject) => {

            const timer = setInterval(() => {
                if (this.failedCallbacks.has(callback)) {
                    clearInterval(timer);
                    return reject(this.failedCallbacks.get(callback).error);
                }

                if (this.completedCallbacks.has(callback)) {
                    clearInterval(timer);
                    return resolve(this.completedCallbacks.get(callback).result as Result);
                }
            }, 25);
        })
    }
}

interface CallbackInfo<Result> {
    exitCondition: (result: Result) => boolean,
    currentInvocation: number;
    invocationsLeft: number,
    delayBetweenInvocations: (i: number) => Duration,
    timeout: Duration
    startedAt: Timestamp,
    errorHandler: (error: Error, result: Result) => void,
    result?: Result,
    error?: Error,
}

function noDelay() {
    return Duration.ofMilliseconds(0);
}

function noEarlyExit() {
    return false;
}

function rethrowErrors(error: Error) {
    throw error;
}
