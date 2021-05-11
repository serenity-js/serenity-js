import 'mocha';

import { given } from 'mocha-testdata';

import { Duration, Timestamp } from '../../src/model';
import { expect } from '../expect';

/** @test {Timestamp} */
describe('Timestamp', () => {

    const
        current_time         = '01 May 2018 10:00 UTC-2',
        current_time_ISO8601 = '2018-05-01T12:00:00.000Z',
        now                  = new Timestamp(new Date(current_time));

    describe('instantiation', () => {

        /** @test {Timestamp} */
        it('can be instantiated with an arbitrary Date', () => {
            expect(() => new Timestamp(new Date())).to.not.throw;
        });

        /** @test {Timestamp} */
        it('defaults to current time if no argument is provided', () => {
            expect(() => new Timestamp()).to.not.throw;
        });

        given<any>(
            {},
            '01 May 2018 10:00 UTC-2',
            0,
        ).
        it('complains if given an incorrect value as a constructor argument', (value: any) => {
            expect(() => new Timestamp()).to.not.throw('Timestamp should be an instance of Date');
        });
    });

    describe('serialisation', () => {

        /** @test {Timestamp} */
        it('is serialised to an ISO-8601-compliant string', () => {
            expect(now.toJSON()).to.equal(current_time_ISO8601);
        });

        /** @test {Timestamp} */
        it('can be deserialised from an ISO-8601-compliant string', () => {
            expect(Timestamp.fromJSON(current_time_ISO8601).equals(now)).to.equal(true);
        });

        given<any>(
            0,
            '',
            null,       // eslint-disable-line unicorn/no-null
            undefined,
            {},
            [],
        ).
        it('complains if given an incorrect value to deserialise', (value: any) => {
            expect(() => Timestamp.fromJSON(value)).to.throw('Timestamp should be an ISO-8601-compliant date');
        });
    });

    describe('arithmetic', () => {

        /** @test {Timestamp} */
        it('allows for calculating a difference between two timestamps', () => {

            const a_bit_later = Timestamp.fromJSON('2018-05-01T12:00:02.752Z');

            expect(now.diff(a_bit_later).equals(Duration.ofMilliseconds(2752))).to.equal(true);
            expect(a_bit_later.diff(now).equals(Duration.ofMilliseconds(2752))).to.equal(true);
        });

        /** @test {Timestamp} */
        it('allows for computing another timestamp, relative to the original one', () => {

            const
                two_minutes = Duration.ofSeconds(120),
                four_minutes = Duration.ofSeconds(240);

            expect(now.plus(two_minutes)).to.equal(now.plus(four_minutes).less(two_minutes));
        });
    });

    describe('conversion', () => {

        /** @test {Timestamp} */
        it('can be converted to a numeric unix timestamp', () => {
            expect(now.toMillisecondTimestamp()).to.equal(Math.floor(now.value.getTime()));
        });

        /** @test {Timestamp} */
        it('can be created from a numeric unix timestamp', () => {
            expect(Timestamp.fromMillisecondTimestamp(Math.floor(now.value.getTime())).toMillisecondTimestamp())
                .to.equal(now.toMillisecondTimestamp());
        });
    });
});
