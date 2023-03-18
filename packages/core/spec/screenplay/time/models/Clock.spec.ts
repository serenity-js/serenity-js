import { describe, it } from 'mocha';

import { Clock, Timestamp } from '../../../../src';
import { expect } from '../../../expect';

describe('Clock', () => {

    describe('when telling time', () => {

        it('provides the current time', () => {
            const clock = new Clock();

            const timestamp = clock.now();

            expect(timestamp).is.instanceOf(Timestamp);
        });

        it('allows for the current time to be stubbed out', () => {
            const now = new Date('2023-03-12T13:24:23.800Z');
            const clock = new Clock(() => now);

            const timestamp = clock.now();

            expect(timestamp).equals(new Timestamp(now));
        });
    });
});
