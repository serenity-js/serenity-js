/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../../../../src';
import { append, Question } from '../../../../../src/screenplay';
import { expect } from '../../../../expect';

/** @test {append} */
/** @test {Question#map} */
describe('append', () => {

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
            .map(append('other value'))
            .answeredBy(quentin);

        return expect(result).to.be.rejectedWith(expected);
    });

    /** @test {append} */
    it('allows for a string to be appended to the original answer', () => {

        const result = q('Hello')
            .map(append('!'))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hello!');
    });

    /** @test {append} */
    it('allows for a Promise<string> to be appended to the original answer', () => {

        const result = q('Hello')
            .map(append(p('!')))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hello!');
    });

    /** @test {append} */
    it('allows for a Question<string> to be appended to the original answer', () => {

        const result = q('Hello')
            .map(append(q('!')))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hello!');
    });

    /** @test {append} */
    it('allows for a Question<Promise<string>> to be appended to the original answer', () => {

        const result = q('Hello')
            .map(append(q(p('!'))))
            .answeredBy(quentin);

        return expect(result).to.eventually.equal('Hello!');
    });
});
