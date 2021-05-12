/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { Question, toLocaleUpperCase } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {toLocaleUpperCase} */
/** @test {Question#map} */
describe('toLocaleUpperCase', () => {

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
            .map(toLocaleUpperCase())
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: 'ı',          expected: 'I' },
        { value: p('ı'),       expected: 'I' },
        { value: q('ı'),       expected: 'I' },
        { value: q(p('ı')),    expected: 'I' },
    ]).
    it('converts the string to upper case, according to any locale-specific case mappings', ({ value, expected }) => {
        const result = q<any>(value)
            .map(toLocaleUpperCase('tr'))
            .answeredBy(quentin);

        return expect(result).to.be.eventually.equal(expected);
    });

    given([
        { value: 'tr'       },
        { value: p('tr')    },
        { value: q('tr')    },
        { value: q(p('tr')) },
    ]).
    it('allows for a list of locales to be provided', ({ value }) => {
        const result = q('ı')
            .map(toLocaleUpperCase(value))
            .answeredBy(quentin);

        return expect(result).to.be.eventually.equal('I');
    });
});
