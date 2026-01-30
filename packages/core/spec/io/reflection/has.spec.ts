
import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { has } from '../../../src/io';
import { expect } from '../../expect';

describe('has', () => {

    const looksLikeADuck = has({
        name:   'string',
        quack:  'function',
    });

    class Duck {
        constructor(public readonly name) {
        }
        quack() {
            return 'quack';
        }
    }

    given([
        { description: 'plain object',  example: { name: 'Daisy', quack: () => 'quack' }    },
        { description: 'instance',      example: new Duck('Daisy')                          },
    ]).
    it('returns true when the candidate has the expected fields and methods', ({ example }) => {
        expect(looksLikeADuck(example)).to.equal(true);
    });

    given([
        { description: 'null',              example: null                                   },
        { description: 'undefined',         example: undefined                              },
        { description: 'empty object',      example: { }                                    },
        { description: 'missing methods',   example: { name: 'Pluto' }                      },
        { description: 'missing field',     example: { quack: () => 'quack' }               },
        { description: 'wrong type',        example: { name: 'Donald', quack: 'quack'   }   },
    ]).
    it('returns false when the candidate does not meet the expectations', ({ example }) => {
        expect(looksLikeADuck(example)).to.equal(false);
    });
});
