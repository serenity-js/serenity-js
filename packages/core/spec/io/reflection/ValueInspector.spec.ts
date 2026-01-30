import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { ValueInspector } from '../../../src/io';
import { expect } from '../../expect';

describe('ValueInspector', () => {

    describe ('isPrimitive(value)', () => {

        given([
            { description: 'undefined', value: undefined,     expected: true    },
            { description: 'null',      value: null,          expected: true    },
            { description: 'number',    value: 42,            expected: true    },
            { description: 'bigint',    value: BigInt(10),    expected: true    },
            { description: 'string',    value: 'example',     expected: true    },
            { description: 'symbol',    value: Symbol('s'),   expected: true    },
            { description: 'object',    value: { k: 'v' },    expected: false   },
            { description: 'array',     value: [ 1, 2, 3 ],   expected: false   },
            { description: 'set',       value: new Set(),     expected: false   },
            { description: 'map',       value: new Map(),     expected: false   },
            { description: 'RegExp',    value: /[Pp]attern/,  expected: false   },
        ]).
        it('describes if a value is a JavaScript primitive', ({ value, expected }) => {
            const result = ValueInspector.isPrimitive(value);

            expect(result).to.equal(expected);
        });
    });

    describe('typeOf(value)', () => {

        function proxy<T extends object>(value: T) {
            return new Proxy(value, {
                getPrototypeOf(target: T): object | null {
                    return Reflect.getPrototypeOf(target);
                }
            })
        }

        class Example {}

        given([
            { description: 'undefined', value: undefined,     expected: 'undefined' },
            { description: 'null',      value: null,          expected: 'null'      },
            { description: 'number',    value: 42,            expected: 'number'    },
            { description: 'bigint',    value: BigInt(10),    expected: 'bigint'    },
            { description: 'string',    value: 'example',     expected: `string`    },
            { description: 'symbol',    value: Symbol('s'),   expected: `symbol`    },
            { description: 'object',    value: { k: 'v' },    expected: `object`    },
            { description: 'array',     value: [ 1, 2, 3 ],   expected: `Array`     },
            { description: 'set',       value: new Set(),     expected: `Set`       },
            { description: 'map',       value: new Map(),     expected: `Map`       },
            { description: 'RegExp',    value: /[Pp]attern/,  expected: `RegExp`    },
            { description: 'instance',  value: new Example(), expected: `Example`   },

            { description: 'Proxy<T>',      value: proxy(new Example()),    expected: `Proxy<Example>`  },
            { description: 'Proxy<Object>', value: new Proxy({}, {}),       expected: `Proxy<Object>`   },

            { description: 'String',    value: new String('hi'),    expected: `String`   },
            { description: 'Number',    value: new Number(12),      expected: `Number`   },

        ]).
        it('describes the type of', ({ value, expected }) => {
            const result = ValueInspector.typeOf(value);

            expect(result).to.equal(expected);
        });
    });
});
