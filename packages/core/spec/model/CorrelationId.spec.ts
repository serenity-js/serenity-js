import { describe } from 'mocha';

import { CorrelationId } from '../../src/model';
import { expect } from '../expect';

describe('CorrelationId', () => {

    it('can represent a Window handle', () => {
        expect(() => {
            new CorrelationId('CDwindow-BD7BE568-52F2-4552-B834-FE2D041DCE5B')
        }).to.not.throw();
    });

    it('can be serialised to JSON', () => {

        const correlationId = CorrelationId.create();

        expect(correlationId.toJSON()).to.match(/[\da-z]/);
    });

    it('can be deserialised from JSON', () => {

        const correlationId = CorrelationId.create();

        const serialised = correlationId.toJSON() as string;

        const deserialised = CorrelationId.fromJSON(serialised);

        expect(deserialised).to.equal(correlationId);
    });

    it('complains when initialised with an invalid value', () => {
        expect(() => {
            new CorrelationId('invalid value with spaces and special characters!');
        }).to.throw('CorrelationId should either be a Cuid or match pattern /^[\\dA-Za-z-]+$/');
    });
});
