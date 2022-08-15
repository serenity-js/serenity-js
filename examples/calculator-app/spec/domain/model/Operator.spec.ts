import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { AdditionOperator, DivisionOperator, LeftParenthesisOperator, Operator, RightParenthesisOperator, SubtractionOperator } from '../../../src';
import { expect } from '../../expect';

describe('Operator', () => {

    given([
        { description: '+', expected: new AdditionOperator() },
        { description: '/', expected: new DivisionOperator() },
        { description: '(', expected: new LeftParenthesisOperator() },
        { description: ')', expected: new RightParenthesisOperator() },
        { description: '-', expected: new SubtractionOperator() },
    ]).
    it('can be instantiated based on its symbol', ({ description, expected }) => {
        expect(Operator.fromString(description).equals(expected)).to.equal(true);
    });
});
