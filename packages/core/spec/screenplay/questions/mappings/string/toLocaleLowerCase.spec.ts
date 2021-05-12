/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { Question,toLocaleLowerCase } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {toLocaleLowerCase} */
/** @test {Question#map} */
describe('toLocaleLowerCase', () => {

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
            .map(toLocaleLowerCase())
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: 'I',          expected: 'ı' },
        { value: p('I'),       expected: 'ı' },
        { value: q('I'),       expected: 'ı' },
        { value: q(p('I')),    expected: 'ı' },
    ]).
    it('converts the string to lower case, according to any locale-specific case mappings', ({ value, expected }) => {
        const result = q<any>(value)
            .map(toLocaleLowerCase('tr'))
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
        const result = q('I')
            .map(toLocaleLowerCase(value))
            .answeredBy(quentin);

        return expect(result).to.be.eventually.equal('ı');
    });
});
