import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { typeOf } from '../../src/io';
import { expect } from '../expect';

class Example {}

describe ('`typeOf` function', () => {

    given([
        { description: 'undefined',         value: undefined,       expected: 'undefined'           },
        { description: 'null',              value: null,            expected: 'null'                },  // eslint-disable-line unicorn/no-null
        { description: 'number',            value: 42,              expected: 'number: 42'          },
        { description: 'string',            value: 'example',       expected: `string: example`     },
        { description: 'symbol',            value: Symbol('s'),     expected: `symbol: s`           },
        { description: 'object',            value: { k: 'v' },      expected: `object`              },
        { description: 'array',             value: [ 1, 2, 3 ],     expected: `array`               },
        { description: 'set',               value: new Set(),       expected: `set`                 },
        { description: 'map',               value: new Map(),       expected: `map`                 },
        { description: 'instance',          value: new Example(),   expected: `instance of Example` },
    ]).
    it('describes the type of', ({ value, expected }) => {
        const result = typeOf(value);

        expect(result).to.equal(expected);
    });
});
