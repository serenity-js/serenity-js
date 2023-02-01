import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { typeOf } from '../../../src/io/reflection';
import { expect } from '../../expect';

class Example {}

function proxy<T extends object>(value: T) {
    return new Proxy(value, {
        getPrototypeOf(target: T): object | null {
            return Reflect.getPrototypeOf(target);
        }
    })
}

describe ('`typeOf` function', () => {

    given([
        { description: 'undefined', value: undefined,     expected: 'undefined' },
        { description: 'null',      value: null,          expected: 'null'      },  // eslint-disable-line unicorn/no-null
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

        /* eslint-disable unicorn/new-for-builtins */
        { description: 'String',    value: new String('hi'),    expected: `String`   },
        { description: 'Number',    value: new Number(12),      expected: `Number`   },
        /* eslint-enable unicorn/new-for-builtins */
    ]).
    it('describes the type of', ({ value, expected }) => {
        const result = typeOf(value);

        expect(result).to.equal(expected);
    });
});
