/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { normalize, Question } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {normalize} */
/** @test {Question#map} */
describe('normalize', () => {

    const quentin = actorCalled('Quentin');

    const q = <T>(value: T) =>
        Question.about<T>('some value', actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    /**
     * U+1E9B: LATIN SMALL LETTER LONG S WITH DOT ABOVE
     * U+0323: COMBINING DOT BELOW
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
     */
    const initialString = '\u1E9B\u0323';

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
            .map(normalize('other value'))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        undefined,
        p(undefined),
        q(undefined),
        q(p(undefined)),
    ]).
    it('uses Canonical Decomposition, followed by Canonical Composition (NFC) form by default', form => {

        const result = q(initialString)
            .map(normalize(form))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('\u1E9B\u0323');
    });

    given([
        'NFC',
        p('NFC'),
        q('NFC'),
        q(p('NFC')),
    ]).
    it('supports Canonical Decomposition, followed by Canonical Composition (NFC) form', form => {

        const result = q(initialString)
            .map(normalize(form))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('\u1E9B\u0323');
    });

    given([
        'NFD',
        p('NFD'),
        q('NFD'),
        q(p('NFD')),
    ]).
    it('supports Canonical Decomposition (NFD) form', form => {

        const result = q(initialString)
            .map(normalize(form))
            .answeredBy(quentin);

        // U+017F: latin small letter long s
        // U+0323: combining dot below
        // U+0307: combining dot above
        return expect(result).to.eventually.equal('\u017F\u0323\u0307');
    });

    given([
        'NFKC',
        p('NFKC'),
        q('NFKC'),
        q(p('NFKC')),
    ]).
    it('supports Compatibility Decomposition, followed by Canonical Composition (NFKC) form', form => {

        const result = q(initialString)
            .map(normalize(form))
            .answeredBy(quentin);

        // U+1E69: latin small letter s with dot below and dot above
        return expect(result).to.eventually.equal('\u1E69');
    });

    given([
        'NFKD',
        p('NFKD'),
        q('NFKD'),
        q(p('NFKD')),
    ]).
    it('supports Compatibility Decomposition (NFKD) form', form => {

        const result = q(initialString)
            .map(normalize(form))
            .answeredBy(quentin);

        // U+0073: latin small letter s
        // U+0323: combining dot below
        // U+0307: combining dot above
        return expect(result).to.eventually.equal('\u0073\u0323\u0307');
    });
});
