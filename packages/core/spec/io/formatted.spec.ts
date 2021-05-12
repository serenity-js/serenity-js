/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { given } from 'mocha-testdata';
import * as util from 'util';   // eslint-disable-line unicorn/import-style

import { formatted } from '../../src/io';
import { Question } from '../../src/screenplay';
import { expect } from '../expect';

/** @test {formatted} */
describe ('`formatted` tag function', () => {

    const
        p  = value => Promise.resolve(value),
        q  = value => Question.about(`the meaning of life`, actor => value),
        i  = value => ({ [util.inspect.custom]: () => value }),
        ts = value => ({ toString: () => value });

    class SomeAttribute {}

    given(
        { description: 'no parameters',             actual: formatted `Hello World!`,                           expected: 'Hello World!'                              },
        { description: 'an undefined parameter',    actual: formatted `param: ${ undefined }`,                  expected: 'param: undefined'                          },
        { description: 'a number parameter',        actual: formatted `Answer: ${ 42 }`,                        expected: 'Answer: 42'                                },
        { description: 'a string parameter',        actual: formatted `Hello ${ 'World' }!`,                    expected: "Hello 'World'!"                            },
        { description: 'an object parameter',       actual: formatted `${ { twitter: '@JanMolak'} }`,           expected: '{ "twitter": "@JanMolak" }'                },
        { description: 'an empty array',            actual: formatted `${ [] }`,                                expected: '[ ]'                                       },
        { description: 'an array parameter',        actual: formatted `${ [1, 2, '3'] }`,                       expected: "[ 1, 2, '3' ]"                             },
        { description: 'an array of params',        actual: formatted `${ [ Promise.resolve(1), q('2') ] }`,    expected: '[ a Promise, the meaning of life ]'        },
        { description: 'an object array parameter', actual: formatted `${ [{ name: 'Jan'}] }`,                  expected: '[ { "name": "Jan" } ]'                     },
        { description: 'a Date parameter',          actual: formatted `${ new Date(818035920000) }`,      expected: '1995-12-04T00:12:00.000Z'                  },
        { description: 'a promised parameter',      actual: formatted `${ p('something') }`,              expected: 'a Promise'                                 },
        { description: 'a question',                actual: formatted `${ q('value') }`,                  expected: 'the meaning of life'                       },
        { description: 'an inspectable object',     actual: formatted `${ i('result') }`,                 expected: 'result'                                    },
        { description: 'an "toStringable" object',  actual: formatted `${ ts('result') }`,                expected: 'result'                                    },
        { description: 'a function parameter',      actual: formatted `${ SomeAttribute }`,                     expected: 'SomeAttribute property'                    },
    ).
    it('produces a human-readable description when given a template with', ({ actual, expected }) => {
        expect(actual).to.equal(expected);
    });

    /** @test {formatted} */
    it('produces a human-readable description when given a template with multiple parameters', () => {
        expect(formatted `Hello, ${ 'World' }! I've got ${ p('result') } for you!`)
            .to.equal("Hello, 'World'! I've got a Promise for you!");
    });
});
