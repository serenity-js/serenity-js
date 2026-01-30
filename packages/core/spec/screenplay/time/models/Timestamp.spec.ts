import { inspect } from 'node:util';

import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Duration, Timestamp } from '../../../../src';
import { expect } from '../../../expect';

describe('Timestamp', () => {

    const
        currentTime        = '01 May 2018 10:00 UTC-2',
        currentTimeIso8601 = '2018-05-01T12:00:00.000Z',
        now                = new Timestamp(new Date(currentTime));

    describe('instantiation', () => {

        it('can be instantiated with an arbitrary Date', () => {
            expect(() => new Timestamp(new Date())).to.not.throw;
        });

        it('defaults to current time if no argument is provided', () => {
            expect(() => new Timestamp()).to.not.throw;
        });

        it('can represent the current point in time', () => {
            expect(() => Timestamp.now()).to.not.throw;
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

        it('is serialised to an ISO-8601-compliant string', () => {
            expect(now.toJSON()).to.equal(currentTimeIso8601);
        });

        it('can be deserialised from an ISO-8601-compliant string', () => {
            expect(Timestamp.fromJSON(currentTimeIso8601).equals(now)).to.equal(true);
        });

        given([
            { description: 'Date around year 0', example: '0001-01-01T00:00:00Z', expected: '0001-01-01T00:00:00.000Z' },
            { description: 'Date in the distant future', example: '9999-01-01T12:30:45Z', expected: '9999-01-01T12:30:45.000Z' },
            { description: 'Another date in the distant future, with millis', example: '3000-12-31T23:59:59.999Z', expected: '3000-12-31T23:59:59.999Z' },
            { description: 'Date with positive offset', example: '2024-01-20T12:30:45+03:00', expected: '2024-01-20T09:30:45.000Z' },
            { description: 'Date time with T separator', example: '2024-01-20T12:30:45Z', expected: '2024-01-20T12:30:45.000Z' },
            { description: 'Date time with t separator', example: '2024-01-20t12:30:45Z', expected: '2024-01-20T12:30:45.000Z' },
            { description: 'Date time with space separator', example: '2024-01-20 12:30:45Z', expected: '2024-01-20T12:30:45.000Z' },
            { description: 'Date with negative offset and milliseconds', example: '2024-01-20T12:30:45.678-05:00', expected: '2024-01-20T17:30:45.678Z' },
            { description: 'Date with no timestamp', example: '1995-01-01', expected: '1995-01-01T00:00:00.000Z' },
        ]).
        it('can be deserialised from other ISO-8601-compliant strings', ({ example, expected }) => {
            expect(Timestamp.fromJSON(example).toISOString()).to.equal(expected);
        })

        it('can be inspected', () => {
            const result = inspect(Timestamp.fromJSON(currentTimeIso8601));

            expect(result).to.equal(`Timestamp(${ currentTimeIso8601 })`);
        });

        given<any>(
            0,
            '',
            null,
            undefined,
            {},
            [],
        ).
        it('complains if given an incorrect value to deserialise', (value: any) => {
            expect(() => Timestamp.fromJSON(value)).to.throw('Timestamp should follow the ISO8601 format: YYYY-MM-DD[Thh:mm[:ss[.sss]]]');
        });
    });

    describe('arithmetic', () => {

        it('allows for calculating a difference between two timestamps', () => {

            const aBitLater = Timestamp.fromJSON('2018-05-01T12:00:02.752Z');

            expect(now.diff(aBitLater).equals(Duration.ofMilliseconds(2752))).to.equal(true);
            expect(aBitLater.diff(now).equals(Duration.ofMilliseconds(2752))).to.equal(true);
        });

        it('allows for computing another timestamp, relative to the original one', () => {

            const
                twoMinutes = Duration.ofSeconds(120),
                fourMinutes = Duration.ofSeconds(240);

            expect(now.plus(twoMinutes)).to.equal(now.plus(fourMinutes).less(twoMinutes));
        });
    });

    describe('conversion', () => {

        it('can be converted to a millisecond timestamp', () => {
            expect(now.toMilliseconds()).to.equal(Math.floor(now.value.getTime()));
        });

        it('can be created from a millisecond timestamp', () => {
            expect(Timestamp.fromTimestampInMilliseconds(now.toMilliseconds()))
                .to.equal(now);
        });

        it('can be converted to a unix timestamp', () => {
            expect(now.toSeconds()).to.equal(Math.floor(now.value.getTime() / 1000));
        });

        it('can be created from a numeric unix timestamp', () => {
            expect(Timestamp.fromTimestampInSeconds(now.toSeconds()))
                .to.equal(now);
        });

        it('can be converted to ISO8601-compatible string', () => {
            expect(now.toISOString()).to.equal(currentTimeIso8601);
        });

        it('returns an IS8601-compatible value when converted to string', () => {
            expect(now.toString()).to.equal(currentTimeIso8601);
        });
    });

    describe('comparison', () => {
        const earlier = Timestamp.fromTimestampInSeconds(0);
        const later   = Timestamp.fromTimestampInSeconds(1);

        it('recognises when two timestamps have the same value', () => {
            expect(earlier.equals(earlier)).to.equal(true);
        });

        it('recognises when one timestamp is before another timestamp', () => {
            expect(earlier.isBefore(later)).to.equal(true);
        });

        it('recognises when one timestamp is before or equal to another timestamp', () => {
            expect(earlier.isBeforeOrEqual(later)).to.equal(true);
            expect(earlier.isBeforeOrEqual(earlier)).to.equal(true);
        });

        it('recognises when one timestamp is after another timestamp', () => {
            expect(later.isAfter(earlier)).to.equal(true);
        });

        it('recognises when one timestamp is after or equal to another timestamp', () => {
            expect(later.isAfterOrEqual(earlier)).to.equal(true);
            expect(later.isAfterOrEqual(earlier)).to.equal(true);
        });
    });

    describe('error handling', () => {
        describe('when provided with an undefined value', () => {

            given([
                { description: 'diff',              method: now.diff.bind(now),             expected: 'timestamp should be defined' },
                { description: 'plus',              method: now.plus.bind(now),             expected: 'duration should be defined' },
                { description: 'less',              method: now.less.bind(now),             expected: 'duration should be defined' },
                { description: 'isBefore',          method: now.isBefore.bind(now),         expected: 'timestamp should be defined' },
                { description: 'isBeforeOrEqual',   method: now.isBeforeOrEqual.bind(now),  expected: 'timestamp should be defined' },
                { description: 'isAfter',           method: now.isAfter.bind(now),          expected: 'timestamp should be defined' },
                { description: 'isAfterOrEqual',    method: now.isAfterOrEqual.bind(now),   expected: 'timestamp should be defined' },
            ]).
            it('complains', ({ method, expected }) => {

                expect(() => method(undefined)).to.throw(Error, expected)
            })
        });
    });
});
