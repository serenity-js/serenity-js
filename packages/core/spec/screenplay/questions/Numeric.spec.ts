import { describe, it } from 'mocha';

import { actorCalled, List, Numeric } from '../../../src';
import { expect } from '../../expect';

describe('Numeric', () => {

    const Sigma = actorCalled('Sigma');

    describe('sum()', () => {

        describe('invoked with no values returns zero when it', () => {

            it('is invoked without an argument', async () => {
                const sum = Numeric.sum();

                expect(sum.toString()).to.equal('the sum of [ ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(0);
            });

            it('is invoked with an empty array', async () => {
                const sum = Numeric.sum([ ]);

                expect(sum.toString()).to.equal('the sum of [ [ ] ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(0);
            });

            it('is invoked with multiple empty arrays', async () => {
                const sum = Numeric.sum([ ], [ ]);

                expect(sum.toString()).to.equal('the sum of [ [ ], [ ] ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(0);
            });
        });

        describe('invoked with a single value', () => {
            it('returns the value itself', async () => {
                const sum = Numeric.sum(1);

                expect(sum.toString()).to.equal('the sum of [ 1 ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(1);
            });
        });

        describe('invoked with multiple values', () => {

            it('adds values provided as an array', async () => {
                const sum = Numeric.sum([ 1, 2, 3 ]);

                expect(sum.toString()).to.equal('the sum of [ [ 1, 2, 3 ] ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(6);
            });

            it('adds values provided as multiple arrays', async () => {
                const sum = Numeric.sum([ 1, 2, 3 ], [ 4, 5, 6 ]);

                expect(sum.toString()).to.equal('the sum of [ [ 1, 2, 3 ], [ 4, 5, 6 ] ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(21);
            });
        });

        describe('invoked with a Question', () => {

            it('adds values provided as a List<number>', async () => {
                const sum = Numeric.sum(List.of([ 1, 2, 3 ]).describedAs('numbers'));

                expect(sum.toString()).to.equal('the sum of [ numbers ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(6);
            });
        });

        describe('error handling', () => {

            it('fails when a value is not a number', async () => {
                const sum = Numeric.sum(1, '2' as any);

                expect(sum.toString()).to.equal('the sum of [ 1, "2" ]');

                await expect(sum.answeredBy(Sigma)).to.be.rejectedWith('"2" should be a number');
            });

            it('fails when a value is undefined', async () => {
                const sum = Numeric.sum([ 1, 2, undefined as any ]);

                expect(sum.toString()).to.equal('the sum of [ [ 1, 2, undefined ] ]');

                await expect(sum.answeredBy(Sigma)).to.be.rejectedWith('undefined should be a number');
            });
        });

        describe('precision', () => {

            it('avoids rounding errors', async () => {
                const sum = Numeric.sum(1_000, 0.1, 0.00000001);

                expect(sum.toString()).to.equal('the sum of [ 1000, 0.1, 1e-8 ]');

                const result = await sum.answeredBy(Sigma);

                expect(result).to.equal(1_000.100_000_01);
            });
        });
    });

    describe('difference()', () => {

        it('calculates the difference between two numbers', async () => {
            const difference = Numeric.difference(5, 2);

            expect(difference.toString()).to.equal('the difference between 5 and 2');

            const result = await difference.answeredBy(Sigma);

            expect(result).to.equal(3);
        });

        it('fails when a value is not a number', async () => {
            const difference = Numeric.difference(5, '2' as any);

            expect(difference.toString()).to.equal('the difference between 5 and "2"');

            await expect(difference.answeredBy(Sigma)).to.be.rejectedWith('"2" should be a number');
        });

        it('fails when a value is undefined', async () => {
            const difference = Numeric.difference(5, undefined as any);

            expect(difference.toString()).to.equal('the difference between 5 and undefined');

            await expect(difference.answeredBy(Sigma)).to.be.rejectedWith('undefined should be a number');
        });
    });

    describe('ceiling()', () => {

        it('calculates the ceiling of a number', async () => {
            const ceiling = Numeric.ceiling(3.14);

            expect(ceiling.toString()).to.equal('the ceiling of 3.14');

            const result = await ceiling.answeredBy(Sigma);

            expect(result).to.equal(4);
        });

        it('fails when a value is not a number', async () => {
            const ceiling = Numeric.ceiling('3.14' as any);

            expect(ceiling.toString()).to.equal('the ceiling of "3.14"');

            await expect(ceiling.answeredBy(Sigma)).to.be.rejectedWith('"3.14" should be a number');
        });

        it('fails when a value is undefined', async () => {
            const ceiling = Numeric.ceiling(undefined as any);

            expect(ceiling.toString()).to.equal('the ceiling of undefined');

            await expect(ceiling.answeredBy(Sigma)).to.be.rejectedWith('undefined should be a number');
        });
    });

    describe('floor()', () => {

        it('calculates the floor of a number', async () => {
            const floor = Numeric.floor(3.14);

            expect(floor.toString()).to.equal('the floor of 3.14');

            const result = await floor.answeredBy(Sigma);

            expect(result).to.equal(3);
        });

        it('fails when a value is not a number', async () => {
            const floor = Numeric.floor('3.14' as any);

            expect(floor.toString()).to.equal('the floor of "3.14"');

            await expect(floor.answeredBy(Sigma)).to.be.rejectedWith('"3.14" should be a number');
        });

        it('fails when a value is undefined', async () => {
            const floor = Numeric.floor(undefined as any);

            expect(floor.toString()).to.equal('the floor of undefined');

            await expect(floor.answeredBy(Sigma)).to.be.rejectedWith('undefined should be a number');
        });
    });

    describe('max()', () => {

        it('calculates the maximum value in a list of numbers', async () => {

            const max = Numeric.max(1, 2, 3);

            expect(max.toString()).to.equal('the max of [ 1, 2, 3 ]');

            const result = await max.answeredBy(Sigma);

            expect(result).to.equal(3);
        });

        it('calculates the maximum value in a list of numbers and arrays of numbers', async () => {

            const max = Numeric.max(1, [ 2, 3 ], 4);

            expect(max.toString()).to.equal('the max of [ 1, [ 2, 3 ], 4 ]');

            const result = await max.answeredBy(Sigma);

            expect(result).to.equal(4);
        });

        it('fails when a value is not a number', async () => {
            const max = Numeric.max(1, [ '2' as any ], 3);

            expect(max.toString()).to.equal('the max of [ 1, [ "2" ], 3 ]');

            await expect(max.answeredBy(Sigma)).to.be.rejectedWith('"2" should be a number');
        });
    });

    describe('min()', () => {

        it('calculates the minimum value in a list of numbers', async () => {

            const min = Numeric.min(3, 1, 2);

            expect(min.toString()).to.equal('the min of [ 3, 1, 2 ]');

            const result = await min.answeredBy(Sigma);

            expect(result).to.equal(1);
        });

        it('calculates the minimum value in a list of numbers and arrays of numbers', async () => {

            const min = Numeric.min(1, [ 2, 3 ], 4, [ 0 ]);

            expect(min.toString()).to.equal('the min of [ 1, [ 2, 3 ], 4, [ 0 ] ]');

            const result = await min.answeredBy(Sigma);

            expect(result).to.equal(0);
        });

        it('fails when a value is not a number', async () => {
            const min = Numeric.min(1, [ '2' as any ], 3);

            expect(min.toString()).to.equal('the min of [ 1, [ "2" ], 3 ]');

            await expect(min.answeredBy(Sigma)).to.be.rejectedWith('"2" should be a number');
        });
    });
});
