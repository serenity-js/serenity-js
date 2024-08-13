import { describe, it } from 'mocha';

import { Clock, Duration, Timestamp } from '../../../../src';
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

    describe('serialisation', () => {
        it('can be serialised to JSON', () => {
            const clock = new Clock();

            expect(clock.toJSON()).to.deep.equal({
                timeAdjustment: { milliseconds: 0 },
            });
        });

        it('includes any custom time adjustment', () => {
            const clock = new Clock();
            clock.setAhead(Duration.ofSeconds(2))

            expect(clock.toJSON()).to.deep.equal({
                timeAdjustment: { milliseconds: 2_000 },
            });
        });
    });
});
