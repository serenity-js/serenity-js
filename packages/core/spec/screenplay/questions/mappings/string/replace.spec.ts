/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { Question,replace } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {replace} */
/** @test {Question#map} */
describe('replace', () => {

    const quentin = actorCalled('Quentin');

    const q = <T>(value: T) =>
        Question.about<T>('some value', actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    given([
        { value: null,              expected: 'The value to be mapped should be defined'  },
        { value: undefined,         expected: 'The value to be mapped should be defined'  },
        { value: 1,                 expected: 'The value to be mapped should be a string' },
        { value: { },               expected: 'The value to be mapped should be a string' },
        { value: [null],            expected: 'The value to be mapped should be defined'  },
        { value: [undefined],       expected: 'The value to be mapped should be defined'  },
        { value: [1],               expected: 'The value to be mapped should be a string' },
        { value: [{ }],             expected: 'The value to be mapped should be a string' },
        { value: p(null),           expected: 'The value to be mapped should be defined'  },
        { value: p(undefined),      expected: 'The value to be mapped should be defined'  },
        { value: p(1),              expected: 'The value to be mapped should be a string' },
        { value: p({ }),            expected: 'The value to be mapped should be a string' },
        { value: p([ null ]),       expected: 'The value to be mapped should be defined'  },
        { value: p([ undefined ]),  expected: 'The value to be mapped should be defined'  },
        { value: p([ 1 ]),          expected: 'The value to be mapped should be a string' },
        { value: p([ { } ]),        expected: 'The value to be mapped should be a string' },
    ]).
    it('complains if the original answer is of a wrong type at runtime', ({ value, expected }) => {
        const result = q<any>(value)
            .map(replace('pattern', 'replacement'))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        {  pattern: 'Hello',        replacement: 'Hi'       },
        {  pattern: p('Hello'),     replacement: 'Hi'       },
        {  pattern: q('Hello'),     replacement: 'Hi'       },
        {  pattern: q(p('Hello')),  replacement: 'Hi'       },
        {  pattern: 'Hello',        replacement: p('Hi')    },
        {  pattern: 'Hello',        replacement: q('Hi')    },
        {  pattern: 'Hello',        replacement: q(p('Hi')) },
    ]).
    it('allows for a string to be replaced with another string', ({ pattern, replacement }) => {

        const result = q('Hello World!')
            .map(replace(pattern, replacement))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hi World!');
    });

    given([
        {  pattern: /(H|h)ello/,        replacement: '$1i'       },
        {  pattern: p(/(H|h)ello/),     replacement: '$1i'       },
        {  pattern: q(/(H|h)ello/),     replacement: '$1i'       },
        {  pattern: q(p(/(H|h)ello/)),  replacement: '$1i'       },
        {  pattern: /(H|h)ello/,        replacement: p('$1i')    },
        {  pattern: /(H|h)ello/,        replacement: q('$1i')    },
        {  pattern: /(H|h)ello/,        replacement: q(p('$1i')) },
    ]).
    it('allows for a RegEx pattern to be replaced with a string', ({ pattern, replacement }) => {

        const result = q('Hello World!')
            .map(replace(pattern, replacement))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hi World!');
    });

    given([
        {  pattern: /[A-Z]/g,        replacement: _ => _.toLowerCase()       },
        {  pattern: p(/[A-Z]/g),     replacement: _ => _.toLowerCase()       },
        {  pattern: q(/[A-Z]/g),     replacement: _ => _.toLowerCase()       },
        {  pattern: q(p(/[A-Z]/g)),  replacement: _ => _.toLowerCase()       },
        {  pattern: /[A-Z]/g,        replacement: p(_ => _.toLowerCase())    },
        {  pattern: /[A-Z]/g,        replacement: q(_ => _.toLowerCase())    },
        {  pattern: /[A-Z]/g,        replacement: q(p(_ => _.toLowerCase())) },
    ]).
    it('allows for a pattern to be replaced with a replacement function', ({ pattern, replacement }) => {

        const result = q('Hello World!')
            .map(replace(pattern, replacement))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('hello world!');
    });
});
