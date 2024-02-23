import { describe } from 'mocha';

import { Clock, Duration, OperationInterruptedError, ScheduleWork } from '../../../../src';
import { expect } from '../../../expect';

describe('ScheduleWork', () => {

    let scheduleWork: ScheduleWork;

    let clock: Clock;

    beforeEach(() => {
        clock = new Clock();
        const timeout = Duration.ofSeconds(2);

        scheduleWork = new ScheduleWork(clock, timeout);
    });

    afterEach(() => {
        scheduleWork.discard();
    });

    it('enables the actor to repeat an operation until a condition is met', async () => {

        const maxCalls = 5;
        let callCount = 0;
        const result = await scheduleWork.repeatUntil(() => ++callCount, {
            exitCondition: result => result >= maxCalls
        });

        expect(result).to.equal(maxCalls);
        expect(callCount).to.equal(maxCalls);
    });

    it('cancels any pending operations when the ability is discarded', async () => {

        const delay = Duration.ofSeconds(5);

        const maxCalls = 5;
        let callCount = 0;
        let actualError: Error;
        const result = scheduleWork.repeatUntil(() => ++callCount, {
            exitCondition: result => result >= maxCalls,
            delayBetweenInvocations: () => delay,
        }).catch(error => {
            actualError = error;
        });

        await scheduleWork.discard();
        clock.setAhead(delay);
        await clock.tick();

        expect(result).to.be.fulfilled;
        expect(callCount).to.be.lessThan(maxCalls);
        expect(actualError).to.be.instanceof(OperationInterruptedError)
        expect(actualError.message).to.equal('Scheduler stopped before executing callback')
    });
});
