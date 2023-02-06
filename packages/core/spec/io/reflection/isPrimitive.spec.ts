import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { isPrimitive } from '../../../src/io';
import { expect } from '../../expect';

describe ('`isPrimitive` function', () => {

    given([
        { description: 'undefined', value: undefined,     expected: true    },
        { description: 'null',      value: null,          expected: true    },  // eslint-disable-line unicorn/no-null
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
        const result = isPrimitive(value);

        expect(result).to.equal(expected);
    });
});
