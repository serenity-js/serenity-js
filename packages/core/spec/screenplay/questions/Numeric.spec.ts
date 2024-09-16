import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

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
            const ceiling = Numeric.ceiling().of(3.14);

            expect(ceiling.toString()).to.equal('the ceiling of 3.14');

            const result = await ceiling.answeredBy(Sigma);

            expect(result).to.equal(4);
        });

        it('fails when a value is not a number', async () => {
            const ceiling = Numeric.ceiling().of('3.14' as any);

            expect(ceiling.toString()).to.equal('the ceiling of "3.14"');

            await expect(ceiling.answeredBy(Sigma)).to.be.rejectedWith('"3.14" should be a number');
        });

        it('fails when a value is undefined', async () => {
            const ceiling = Numeric.ceiling().of(undefined as any);

            expect(ceiling.toString()).to.equal('the ceiling of undefined');

            await expect(ceiling.answeredBy(Sigma)).to.be.rejectedWith('undefined should be a number');
        });
    });

    describe('floor()', () => {

        it('calculates the floor of a number', async () => {
            const floor = Numeric.floor().of(3.14);

            expect(floor.toString()).to.equal('the floor of 3.14');

            const result = await floor.answeredBy(Sigma);

            expect(result).to.equal(3);
        });

        it('fails when a value is not a number', async () => {
            const floor = Numeric.floor().of('3.14' as any);

            expect(floor.toString()).to.equal('the floor of "3.14"');

            await expect(floor.answeredBy(Sigma)).to.be.rejectedWith('"3.14" should be a number');
        });

        it('fails when a value is undefined', async () => {
            const floor = Numeric.floor().of(undefined as any);

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

    describe('intValue()', () => {

        given([
            { description: 'default base (assumed to be 10)', base: undefined, value: '10', expected: 10 },
            { description: 'padded', base: undefined, value: '  10  ', expected: 10 },
            { description: 'base 0 (assumed to be 10)', base: 0, value: '10', expected: 10 },
            { description: 'default base (assumed to be 16)', base: undefined, value: '0x10', expected: 16 },
            { description: 'base 0 (assumed to be 16)', base: 0, value: '0x10', expected: 16 },
            { description: 'base 2', base: 2, value: '10', expected: 2 },
            { description: 'base 8', base: 8, value: '10', expected: 8 },
            { description: 'base 10', base: 10, value: '10', expected: 10 },
            { description: 'base 36', base: 36, value: '10', expected: 36 },
        ]).
        it('parses a string value and returns an integer of the specified base', async ({ base, value, expected }) => {
            const intValue = Numeric.intValue(base).of(value);

            expect(intValue.toString()).to.equal(`the integer value of "${ value }"`);

            const result = await intValue.answeredBy(Sigma);

            expect(result).to.equal(expected);
        });

        given([
            { description: 'extra leading characters', value: '$3.14' },
            { description: 'non-numeric string',       value: 'hello' },
        ]).
        it('fails when the parsed string is not a number', async ({ value }) => {

            const floatValue = Numeric.intValue().of(value);

            expect(floatValue.toString()).to.equal(`the integer value of "${ value }"`);

            await expect(floatValue.answeredBy(Sigma))
                .to.be.rejectedWith(TypeError, `Parsing "${ value }" as an integer value returned a NaN`);
        });

        it('fails when a value is not a string', async () => {
            const intValue = Numeric.intValue().of(new Date('2024-09-12T00:00:00.000Z') as any);

            expect(intValue.toString()).to.equal('the integer value of Date(2024-09-12T00:00:00.000Z)');

            await expect(intValue.answeredBy(Sigma)).to.be.rejectedWith('Date(2024-09-12T00:00:00.000Z) should be a string');
        });

        it('fails when the base is not a number', async () => {
            const intValue = Numeric.intValue('10' as any).of('100');

            expect(intValue.toString()).to.equal('the integer value of "100"');

            await expect(intValue.answeredBy(Sigma)).to.be.rejectedWith('base "10" should be a number');
        });
    });

    describe('bigIntValue()', () => {

        /*
         * Examples inspired by MDN BigInt documentation
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#description
         */
        const hugeNumber = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
        const hugeString = BigInt(`9007199254740991`);
        const hugeHex    = BigInt(`0x1fffffffffffff`);
        const hugeOctal  = BigInt(`0o377777777777777777`);
        const hugeBinary = BigInt(`0b11111111111111111111111111111111111111111111111111111`);

        given([
            { description: 'decimal',       value: '10',                expected: BigInt('10') },
            { description: 'padded',        value: '  10  ',            expected: BigInt('10') },
            { description: 'hugeNumber',    value: `${ hugeNumber }`,   expected: hugeNumber },
            { description: 'hugeString',    value: `${ hugeString }`,   expected: hugeString },
            { description: 'hugeHex',       value: `${ hugeHex }`,      expected: hugeHex },
            { description: 'hugeOctal',     value: `${ hugeOctal }`,    expected: hugeOctal },
            { description: 'hugeBin',       value: `${ hugeBinary }`,   expected: hugeBinary },
        ]).
        it('parses a string value and returns a bigint', async ({ value, expected }) => {

            const bigIntValue = Numeric.bigIntValue().of(value);

            expect(bigIntValue.toString()).to.equal(`the bigint value of "${ value }"`);

            const result = await bigIntValue.answeredBy(Sigma);

            expect(result).to.equal(expected);
        });

        it('fails when a value is not a string', async () => {
            const intValue = Numeric.bigIntValue().of(new Date('2024-09-12T00:00:00.000Z') as any);

            expect(intValue.toString()).to.equal('the bigint value of Date(2024-09-12T00:00:00.000Z)');

            await expect(intValue.answeredBy(Sigma)).to.be.rejectedWith('Date(2024-09-12T00:00:00.000Z) should be a string');
        });

        given([
            { description: 'extra leading characters', value: '$3.14' },
            { description: 'non-numeric string',       value: 'hello' },
        ]).
        it('fails when the parsed string is not a bigint', async ({ value }) => {

            const floatValue = Numeric.bigIntValue().of(value);

            expect(floatValue.toString()).to.equal(`the bigint value of "${ value }"`);

            await expect(floatValue.answeredBy(Sigma))
                .to.be.rejectedWith(TypeError, `Parsing "${ value }" as a bigint value returned an error: Cannot convert ${ value } to a BigInt`);
        });
    });

    describe('floatValue()', () => {

        given([
            { description: 'decimal',                    value: '3.14',      expected: 3.14 },
            { description: 'padded',                     value: '  3.14  ',  expected: 3.14 },
            { description: 'scientific (e-2)',           value: '314e-2"',   expected: 3.14 },
            { description: 'scientific (e+2)',           value: '0.0314E+2', expected: 3.14 },
            { description: 'extra trailing characters',  value: '3.14',     expected: 3.14 },
        ]).
        it('parses a string value and returns a float', async ({ value, expected }) => {

            const floatValue = Numeric.floatValue().of(value);

            expect(floatValue.toString()).to.equal(`the float value of "${ value }"`);

            const result = await floatValue.answeredBy(Sigma);

            expect(result).to.equal(expected);
        });

        it('fails when a value is not a string', async () => {
            const floatValue = Numeric.floatValue().of(new Date('2024-09-12T00:00:00.000Z') as any);

            expect(floatValue.toString()).to.equal('the float value of Date(2024-09-12T00:00:00.000Z)');

            await expect(floatValue.answeredBy(Sigma)).to.be.rejectedWith('Date(2024-09-12T00:00:00.000Z) should be a string');
        });

        given([
            { description: 'extra leading characters', value: '$3.14' },
            { description: 'non-numeric string',       value: 'hello' },
        ]).
        it('fails when the parsed string is not a float', async ({ value }) => {

            const floatValue = Numeric.floatValue().of(value);

            expect(floatValue.toString()).to.equal(`the float value of "${ value }"`);

            await expect(floatValue.answeredBy(Sigma))
                .to.be.rejectedWith(TypeError, `Parsing "${ value }" as a float value returned a NaN`);
        });
    });
});
