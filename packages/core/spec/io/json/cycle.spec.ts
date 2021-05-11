/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-zero-fractions,unicorn/prevent-abbreviations */
import 'mocha';

import { given } from 'mocha-testdata';

import { parse, stringify } from '../../../src/io';
import { expect } from '../../expect';

describe('cycle', () => {

    describe('when used with primitives', () => {

        describe('stringify', () => {

            given([
                { description: 'number',    value: 1.5          },
                { description: 'string',    value: 'hi'         },
                { description: 'boolean',   value: true         },
                { description: 'null',      value: null         },
                { description: 'undefined', value: void 0       },
            ]).
            it('behaves just like JSON.stringify', (value: any) => {
                expect(stringify(value)).to.equal(JSON.stringify(value));
            });
        });

        describe('parse', () => {

            given([
                { description: 'number',    value: '1.5',   expected: 1.5       },
                { description: 'string',    value: '"hi"',  expected: 'hi'      },
                { description: 'boolean',   value: 'true',  expected: true      },
                { description: 'null',      value: 'null',  expected: null      },
            ]).
            it('behaves just like JSON.parse', ({  value, expected }) => {
                expect(parse(value)).to.equal(JSON.parse(value));
                expect(parse(value)).to.equal(expected);
            });
        });
    });

    describe('when used with acyclic objects', () => {

        describe('stringify', () => {

            given([
                { description: 'empty object',  value: { }                               },
                { description: 'simple object', value: { name: 'Jan' }                   },
                { description: 'nested object', value: { l1: { l2: 'value'} }            },
                { description: 'empty array',   value: []                                },
                { description: 'simple array',  value: [ '1', 2, 3.0 ]                   },
                { description: 'nested array',  value: [ [ '1' ], [['2']], '3' ]         },
                { description: 'mixed',         value: [{ values: [1, { name: 'Jan' }]}] },
            ]).
            it('behaves just like JSON.stringify', (value: any) => {
                expect(stringify(value)).to.equal(JSON.stringify(value));
            });
        });

        describe('parse', () => {

            given([
                { description: 'empty object',  value: '{}',                                expected: { }                               },
                { description: 'simple object', value: '{"name":"Jan"}',                    expected: { name: 'Jan'}                    },
                { description: 'nested object', value: '{"l1":{"l2":"value"}}',             expected: { l1: { l2: 'value'} }            },
                { description: 'empty array',   value: '[]',                                expected: []                                },
                { description: 'simple array',  value: '["1",2,3]',                         expected: [ '1', 2, 3.0 ]                   },
                { description: 'nested array',  value: '[["1"],[["2"]],"3"]',               expected: [ [ '1' ], [['2']], '3' ]         },
                { description: 'mixed',         value: '[{"values":[1,{"name":"Jan"}]}]',   expected: [{ values: [1, { name: 'Jan' }]}] },
            ]).
            it('behaves just like JSON.parse', ({  value, expected }) => {
                expect(parse(value)).to.deep.equal(JSON.parse(value));
                expect(parse(value)).to.deep.equal(expected);
            });
        });
    });

    describe('when used with cyclic objects', () => {

        describe('JSON.stringify', () => {

            it('should fail because of a circular reference in a round robin list', () => {
                expect(() => JSON.stringify(roundRobin(2)))
                    .to.throw(TypeError, 'Converting circular structure to JSON');
            });

            it('should fail because of a circular reference in simple nested object', () => {
                expect(() => JSON.stringify(simpleNestedObject()))
                    .to.throw(TypeError, 'Converting circular structure to JSON');
            });

            it('should fail because of a circular reference in complex nested object', () => {
                expect(() => JSON.stringify(complexNestedObject()))
                    .to.throw(TypeError, 'Converting circular structure to JSON');
            });

            it('should fail because of a cycles in object with parallel references', () => {
                expect(() => JSON.stringify(objectWithParallelReferences()))
                    .to.throw(TypeError, 'Converting circular structure to JSON');
            });
        });

        describe('stringify', () => {
            it('should serialise a round robin list data structure', () => {
                expect(stringify(roundRobin(1)))
                    .to.equal('[{"prev":{"$ref":"$[0]"}}]');
            });

            it('should serialise a simple nested object', () => {
                expect(stringify(simpleNestedObject()))
                    .to.equal('{"property":"value","self":{"$ref":"$"}}');
            });

            it('should serialise a complex nested object', () => {
                expect(stringify(complexNestedObject()))
                    .to.equal('{"property":"value","another":{"property":"another value","self":{"$ref":"$[\\"another\\"]"}},"self":{"$ref":"$"}}');
            });

            it('should serialise an object with parallel references', () => {
                expect(stringify(objectWithParallelReferences()))
                    .to.equal('{"property1":{"value":42,"sibling":{"$ref":"$[\\"property1\\"]"}},"property2":{"$ref":"$[\\"property1\\"]"}}');
            });
        });

        describe('parse', () => {

            it('should deserialise a round robin list data structure', () => {
                expect(parse(stringify(roundRobin(1))))
                    .to.deep.equal(roundRobin(1));
            });

            it('should deserialise a simple nested object', () => {
                expect(parse(stringify(simpleNestedObject())))
                    .to.deep.equal(simpleNestedObject());
            });

            it('should deserialise a complex nested object', () => {
                expect(parse(stringify(complexNestedObject())))
                    .to.deep.equal(complexNestedObject());
            });

            it('should deserialise an object with parallel references', () => {
                expect(parse(stringify(objectWithParallelReferences())))
                    .to.deep.equal(objectWithParallelReferences());
            });
        });

        function roundRobin(segments: number) {
            if (segments <= 0) {
                return [];
            }

            const list = [];
            let prev = null;

            for (let i = 0; i < segments; ++i) {
                prev = list[i] = { prev }
            }

            list[0].prev = list[segments - 1];

            return list;
        }

        function simpleNestedObject() {

            const sample = {
                property: 'value',
                self: undefined,
            };
            sample.self = sample;

            return sample;
        }

        function complexNestedObject() {

            const sample = {
                property: 'value',
                another: {
                    property: 'another value',
                    self: undefined,
                },
                self: undefined,
            };
            sample.another.self = sample.another;
            sample.self = sample;

            return sample;
        }

        function objectWithParallelReferences() {

            const property = {
                value: 42,
                sibling: undefined,
            }

            const sample = {
                property1: property,
                property2: property,
            };

            sample.property1.sibling = sample.property2;
            sample.property2.sibling = sample.property1;

            return sample;
        }
    });
});
