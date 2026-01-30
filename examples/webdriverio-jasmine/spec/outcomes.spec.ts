import 'jasmine';

import { TestCompromisedError } from '@serenity-js/core';
import assert = require('assert');

describe('outcomes', () => {

    describe('correctly reports when the test', () => {

        it('passes', () => {
            // no-op
        });

        it('fails', () => {
            assert.strictEqual(false, true);
        });

        it('is pending');

        xit('is skipped', function () {
            // no-op
        });

        it('is compromised', () => {
            throw new TestCompromisedError('The server is down, please cheer it up');
        });
    });
});
