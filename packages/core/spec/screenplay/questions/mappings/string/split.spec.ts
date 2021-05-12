/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { Question,split } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {split} */
/** @test {Question#map} */
describe('split', () => {

    const quentin = actorCalled('Quentin');

    const q = <T>(value: T) =>
        Question.about<T>('some value', actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    given([
        { value: null,              expected: 'The value to be mapped should be defined'    },
        { value: undefined,         expected: 'The value to be mapped should be defined'    },
        { value: 1,                 expected: 'The value to be mapped should be a string'   },
        { value: { },               expected: 'The value to be mapped should be a string'   },
        { value: [null],            expected: 'The value to be mapped should be defined'    },
        { value: [undefined],       expected: 'The value to be mapped should be defined'    },
        { value: [1],               expected: 'The value to be mapped should be a string'   },
        { value: [{ }],             expected: 'The value to be mapped should be a string'   },
        { value: p(null),           expected: 'The value to be mapped should be defined'    },
        { value: p(undefined),      expected: 'The value to be mapped should be defined'    },
        { value: p(1),              expected: 'The value to be mapped should be a string'   },
        { value: p({ }),            expected: 'The value to be mapped should be a string'   },
        { value: p([ null ]),       expected: 'The value to be mapped should be defined'    },
        { value: p([ undefined ]),  expected: 'The value to be mapped should be defined'    },
        { value: p([ 1 ]),          expected: 'The value to be mapped should be a string'   },
        { value: p([ { } ]),        expected: 'The value to be mapped should be a string'   },
    ]).
    it('complains if the original answer is of a wrong type at runtime', ({ value, expected }) => {
        const result = q<any>(value)
            .map(split(','))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    /**
     * When the empty string ("") is used as a separator,
     * the string is not split by user-perceived characters (grapheme clusters)
     * or unicode characters (codepoints), but by UTF-16 codeunits.
     *
     * So to avoid mistakes, split() will complain if you give it an empty string.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
     */
    given([
        { value: '',            expected: 'The separator should not be blank' },
        { value: p(''),         expected: 'The separator should not be blank' },
    ]).
    it('complains if provided with an empty separator', ({ value, expected }) => {
        const result = q(value)
            .map(split(''))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: 'John,Smith,Dock Road',        expected: ['John', 'Smith', 'Dock Road' ] },
        { value: p('John,Smith,Dock Road'),     expected: ['John', 'Smith', 'Dock Road' ] },
    ]).
    it('divides a string into an ordered list of substrings', ({ value, expected }) => {
        const result = q(value)
            .map(split(','))
            .answeredBy(quentin);

        return expect(result).to.be.eventually.deep.equal(expected);
    });

    /** @test {split} */
    it('can limit the number of substrings returned', () => {
        const result = q('John,Smith,Dock Road')
            .map(split(',', 2))
            .answeredBy(quentin);

        return expect(result).to.be.eventually.deep.equal(['John', 'Smith']);
    });
});
