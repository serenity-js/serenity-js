import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { ArgumentDehydrator } from '../../../src';
import { rehydrate } from '../../../src/scripts';

class Complex {
    constructor(public readonly value: string) {
    }

    toJSON() {
        return {
            type: Complex.name,
            value: this.value,
        };
    }
}

describe('ArgumentDehydrator', () => {

    const simpleObject = { name: 'simple-value' };
    const complexObject0 = new Complex('complex-value-0');
    const complexObject1 = new Complex('complex-value-1');
    const serialisedComplexObject0 = { type: Complex.name, value: 'complex-value-0' };
    const serialisedComplexObject1 = { type: Complex.name, value: 'complex-value-1' };

    const shouldReference = (item: any): item is Complex => item instanceof Complex;
    const transformation = (item: Complex) => item.toJSON();

    const dehydrator = new ArgumentDehydrator<Complex, { type: string, value: string }>(shouldReference, transformation);

    it('should return the inapplicable arguments as-is and without referencing any', async () => {
        const inputArgs = [ false, 1, 'string', [], simpleObject, [ simpleObject ] ];

        const result = await dehydrator.dehydrate(inputArgs)

        expect(result).to.deep.equal([
            { argsCount: inputArgs.length, refsCount: 0 },
            ...inputArgs,
        ]);
    });

    it('should reference and transform applicable arguments', async () => {
        const inputArgs = [ false, complexObject0, [], complexObject1 ];

        const result = await dehydrator.dehydrate(inputArgs);

        expect(result).to.deep.equal([
            { argsCount: inputArgs.length, refsCount: 2 },
            false, '$ref0', [], '$ref1', serialisedComplexObject0, serialisedComplexObject1,
        ]);
    });

    it('should reference and transform applicable arguments nested in arrays', async () => {
        const inputArgs = [ [ complexObject0, 1 ] ];

        const result = await dehydrator.dehydrate(inputArgs);

        expect(result).to.deep.equal([
            { argsCount: inputArgs.length, refsCount: 1 },
            [ '$ref0', 1 ], serialisedComplexObject0,
        ]);
    });

    it('should reference and transform applicable arguments nested in objects', async () => {
        const inputArgs = [ { exclude: complexObject0, include: complexObject1 } ];

        const result = await dehydrator.dehydrate(inputArgs);

        expect(result).to.deep.equal([
            { argsCount: inputArgs.length, refsCount: 2 },
            { exclude: '$ref0', include: '$ref1' }, serialisedComplexObject0, serialisedComplexObject1,
        ]);
    });

    it('should reference and transform applicable arguments deeply nested in objects', async () => {
        const inputArgs = [ { exclude: [ complexObject0 ], include: [ complexObject1 ] } ];

        const result = await dehydrator.dehydrate(inputArgs);

        expect(result).to.deep.equal([
            { argsCount: inputArgs.length, refsCount: 2 },
            { exclude: [ '$ref0' ], include: [ '$ref1' ] }, serialisedComplexObject0, serialisedComplexObject1,
        ]);
    });

    describe('argument list', () => {

        it('should represent the pre-serialised result as array where the first element is an object with the counts of arguments and references', async () => {

            const inputArgs = [ { exclude: [ complexObject0 ], include: [ complexObject0, complexObject1 ] } ];

            const result = await dehydrator.dehydrate(inputArgs);

            expect(result).to.deep.equal([
                { argsCount: 1, refsCount: 3 },
                { exclude: [ '$ref0' ], include: [ '$ref1', '$ref2' ] },
                serialisedComplexObject0,
                serialisedComplexObject0,
                serialisedComplexObject1,
            ]);

            const outputArgs = await rehydrate(...result);

            expect(outputArgs).to.deep.equal([
                { exclude: [ serialisedComplexObject0 ], include: [ serialisedComplexObject0, serialisedComplexObject1 ] }
            ]);
        });

    });
});

