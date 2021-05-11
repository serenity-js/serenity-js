/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { Question,slice } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {slice} */
/** @test {Question#map} */
describe('slice', () => {

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
            .map(slice(0, 1))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: Number.NaN,        expected: 'startIndex should be an integer' },
        { value: null,              expected: 'startIndex should be defined'    },
        { value: undefined,         expected: 'startIndex should be defined'    },
        { value: '',                expected: 'startIndex should be an integer' },
        { value: { },               expected: 'startIndex should be an integer' },
        { value: p(Number.NaN),     expected: 'startIndex should be an integer' },
        { value: p(null),           expected: 'startIndex should be defined'    },
        { value: p(undefined),      expected: 'startIndex should be defined'    },
        { value: p(''),             expected: 'startIndex should be an integer' },
        { value: p({ }),            expected: 'startIndex should be an integer' },
        { value: q(Number.NaN),     expected: 'startIndex should be an integer' },
        { value: q(null),           expected: 'startIndex should be defined'    },
        { value: q(undefined),      expected: 'startIndex should be defined'    },
        { value: q(''),             expected: 'startIndex should be an integer' },
        { value: q({ }),            expected: 'startIndex should be an integer' },
        { value: q(p(Number.NaN)),  expected: 'startIndex should be an integer' },
        { value: q(p(null)),        expected: 'startIndex should be defined'    },
        { value: q(p(undefined)),   expected: 'startIndex should be defined'    },
        { value: q(p('')),          expected: 'startIndex should be an integer' },
        { value: q(p({ })),         expected: 'startIndex should be an integer' },
    ]).
    it('complains if startIndex is invalid at runtime', ({ value, expected }) => {
        const result = q('Hello World!')
            .map(slice(value, 1))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: Number.NaN,        expected: 'endIndex should be an integer'   },
        { value: null,              expected: 'endIndex should be an integer'   },
        { value: '',                expected: 'endIndex should be an integer'   },
        { value: { },               expected: 'endIndex should be an integer'   },
        { value: p(Number.NaN),     expected: 'endIndex should be an integer'   },
        { value: p(null),           expected: 'endIndex should be an integer'   },
        { value: p(''),             expected: 'endIndex should be an integer'   },
        { value: p({ }),            expected: 'endIndex should be an integer'   },
        { value: q(Number.NaN),     expected: 'endIndex should be an integer'   },
        { value: q(null),           expected: 'endIndex should be an integer'   },
        { value: q(''),             expected: 'endIndex should be an integer'   },
        { value: q({ }),            expected: 'endIndex should be an integer'   },
        { value: q(p(Number.NaN)),  expected: 'endIndex should be an integer'   },
        { value: q(p(null)),        expected: 'endIndex should be an integer'   },
        { value: q(p('')),          expected: 'endIndex should be an integer'   },
        { value: q(p({ })),         expected: 'endIndex should be an integer'   },
    ]).
    it('complains if endIndex is invalid at runtime', ({ value, expected }) => {
        const result = q('Hello World!')
            .map(slice(0, value))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    given([
        { value: undefined       },
        { value: p(undefined)    },
    ]).
    it('extracts the part of the string from `startIndex` to the end of the string if `endIndex` is not defined', ({ value}) => {
        const result = q('Hello World!')
            .map(slice(6, value))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('World!');
    });

    /** @test {slice} */
    it('extracts the part of the string from `startIndex` to `endIndex`', () => {
        const result = q('Hello World!')
            .map(slice(6, -1))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('World');
    });
});
