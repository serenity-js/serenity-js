
import { describe, it } from 'mocha';

import { ExpectationDetails, Unanswered } from '../../../src';
import { expect } from '../../expect';

describe('ExpectationDetails', () => {

    describe('when describing a parameter-less expectation function', () => {

        it('provides a description', () => {
            const details = ExpectationDetails.of('isPresent');
            expect(details.toString()).to.equal('isPresent()');
        });

        it('allows for the details to be serialised to JSON', () => {
            const details = ExpectationDetails.of('isPresent');

            expect(details.toJSON()).to.deep.equal({
                name: 'isPresent',
                args: [],
            });
        });

        it('allows for the details to be de-serialised from JSON', () => {
            const details = ExpectationDetails.of('isPresent');
            const deserialised = ExpectationDetails.fromJSON(details.toJSON());

            expect(deserialised).to.equal(details);
        });
    });

    describe('when describing an expectation function with an unanswered argument', () => {

        it('provides a description', () => {
            const details = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());
            expect(details.toString()).to.equal('containAtLeastOneItemThat(<<unanswered>>)');
        });

        it('allows for the details to be serialised to JSON', () => {
            const details = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());

            expect(details.toJSON()).to.deep.equal({
                name: 'containAtLeastOneItemThat',
                args: [{
                    type: 'Unanswered',
                    value: undefined,
                }],
            });
        });

        it('allows for the details to be de-serialised from JSON', () => {
            const details = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());
            const deserialised = ExpectationDetails.fromJSON(details.toJSON());

            expect(deserialised).to.equal(details);
        });
    });

    describe('when describing an expectation function with an ExpectationDetails argument', () => {

        it('provides a description', () => {
            const nested = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());
            const details = ExpectationDetails.of('containAtLeastOneItemThat', nested);
            expect(details.toString()).to.equal('containAtLeastOneItemThat(containAtLeastOneItemThat(<<unanswered>>))');
        });

        it('allows for the details to be serialised to JSON', () => {
            const nested = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());
            const details = ExpectationDetails.of('containAtLeastOneItemThat', nested);

            expect(details.toJSON()).to.deep.equal({
                name: 'containAtLeastOneItemThat',
                args: [{
                    type: 'ExpectationDetails',
                    value: {
                        name: 'containAtLeastOneItemThat',
                        args: [{
                            type: 'Unanswered',
                            value: undefined,
                        }]
                    },
                }],
            });
        });

        it('allows for the details to be de-serialised from JSON', () => {
            const nested = ExpectationDetails.of('containAtLeastOneItemThat', new Unanswered());
            const details = ExpectationDetails.of('containAtLeastOneItemThat', nested);
            const deserialised = ExpectationDetails.fromJSON(details.toJSON());

            expect(deserialised).to.equal(details);
        });
    });
});
