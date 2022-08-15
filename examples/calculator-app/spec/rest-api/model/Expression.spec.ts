import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { AdditionOperator, DivisionOperator, LeftParenthesisOperator, MultiplicationOperator, Operand, RightParenthesisOperator, SubtractionOperator } from '../../../src/domain/model';
import { Expression } from '../../../src/rest-api/model';
import { expect } from '../../expect';

describe('Expression', () => {

    given([
        { description: 'an integer',        expression: '2',            expected: [ new Operand(2) ] },
        { description: 'a number',          expression: '2.123',        expected: [ new Operand(2.123) ] },
        { description: 'negative number',   expression: '-2.1',         expected: [ new SubtractionOperator(), new Operand(2.1) ] },
        { description: 'addition',          expression: '1 + 2',        expected: [ new Operand(1),   new AdditionOperator(),       new Operand(2) ] },
        { description: 'subtraction',       expression: '5 - 7.2',      expected: [ new Operand(5),   new SubtractionOperator(),    new Operand(7.2) ] },
        { description: 'division',          expression: '4 / 2',        expected: [ new Operand(4),   new DivisionOperator(),       new Operand(2) ] },
        { description: 'multiplication',    expression: '2.5 * 7',      expected: [ new Operand(2.5), new MultiplicationOperator(), new Operand(7) ] },
        { description: 'parenthesis',       expression: '((2 + 2) * 2) / 4',  expected: [
            new LeftParenthesisOperator(),
            new LeftParenthesisOperator(),
            new Operand(2),
            new AdditionOperator(),
            new Operand(2),
            new RightParenthesisOperator(),
            new MultiplicationOperator(),
            new Operand(2),
            new RightParenthesisOperator(),
            new DivisionOperator(),
            new Operand(4),
        ] },
        { description: 'double negative',   expression: '- 3 - (-2)',  expected: [
            new SubtractionOperator(),
            new Operand(3),
            new SubtractionOperator(),
            new LeftParenthesisOperator(),
            new SubtractionOperator(),
            new Operand(2),
            new RightParenthesisOperator(),
        ] },
        { description: 'triple negative',   expression: '-(-(-1))',  expected: [
            new SubtractionOperator(),
            new LeftParenthesisOperator(),
            new SubtractionOperator(),
            new LeftParenthesisOperator(),
            new SubtractionOperator(),
            new Operand(1),
            new RightParenthesisOperator(),
            new RightParenthesisOperator(),
        ] },
    ]).
    it('represents the expression requested by the user', ({ expression, expected }) => {
        const calculation = Expression.fromString(expression);

        expect(calculation.tokens).to.have.lengthOf(expected.length);
        calculation.tokens.forEach((token, i) => {
            expect(token).to.equal(expected[i]);
        });
    });

    it('complains when provided with an invalid character', () => {
        expect(() => Expression.fromString('(2 * 💣)')).to.throw(Error, 'Invalid character at position 5');
    });
});
