import { describe } from 'mocha';

import { Clock, Duration, ScheduleWork } from '../../../../src';
import { expect } from '../../../expect';

describe('ScheduleWork', () => {

    let scheduleWork: ScheduleWork;

    beforeEach(() => {
        const clock = new Clock();
        const timeout = Duration.ofSeconds(2);

        scheduleWork = new ScheduleWork(clock, timeout);
    });

    afterEach(() => {
        scheduleWork.discard();
    });

    it('starts the scheduler when the ability is initialised', async () => {

        expect(scheduleWork.isInitialised()).to.equal(false);

        scheduleWork.initialise()

        expect(scheduleWork.isInitialised()).to.equal(true);

        const maxCalls = 5;
        let callCount = 0;
        const result = await scheduleWork.repeatUntil(() => ++callCount, {
            exitCondition: result => result >= maxCalls
        });

        expect(result).to.equal(maxCalls);
        expect(callCount).to.equal(maxCalls);
    });
});
