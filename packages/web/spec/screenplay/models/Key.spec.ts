import { expect } from '@integration/testing-tools';
import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { Key } from '../../../src';

describe('Key', () => {

    given([
        { key: Key.Alt,         expected: 'Alt',          description: 'Single key name' },
        { key: Key.F11,         expected: 'F11',          description: 'Key and number' },
        { key: Key.ArrowLeft,   expected: 'Arrow Left',   description: 'Two word name, camel case' },
        { key: Key.Numpad9,     expected: 'Numpad 9',     description: 'Word and number' },
    ]).
    it('produces a human-friendly description of each key', ({ key, expected }) => {
        expect(key.toString()).to.equal(expected);
    });
});
