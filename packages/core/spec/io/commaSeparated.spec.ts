import 'mocha';

import { given } from 'mocha-testdata';

import { commaSeparated } from '../../src/io';
import { expect } from '../expect';

describe('commaSeparated', () => {

    it('returns an empty string for an empty list', () => {
        expect(commaSeparated([])).to.equal('');
    });

    given([
        { list: [ 'value' ], expected: 'value' }
    ]).
    it('returns a string representation of a singleton list', ({ list, expected }) => {
        expect(commaSeparated(list)).to.equal(expected);
    });

    given([
        { list: [ 'first', 'second' ], expected: 'first and second' }
    ]).
    it('joins the last two elements with an "and"', ({ list, expected }) => {
        expect(commaSeparated(list)).to.equal(expected);
    });

    given([
        { list: [ 'first', 'second', 'third', 'fourth' ], expected: 'first, second, third and fourth' }
    ]).
    it('joins other elements with a comma', ({ list, expected }) => {
        expect(commaSeparated(list)).to.equal(expected);
    });
});
