import 'jasmine';

import { TestCompromisedError } from '@serenity-js/core';
import assert = require('assert');

describe('@serenity-js/webdriverio', () => {

    describe('correctly reports when the test', () => {

        it('passes', () => {
            // no-op
        });

        it('fails', () => {
            assert.strictEqual(false, true);
        });

        it('is pending');   // eslint-disable-line mocha/no-pending-tests

        xit('is skipped', function () { // eslint-disable-line mocha/no-skipped-tests
            // no-op
        });

        it('is compromised', () => {
            throw new TestCompromisedError('The server is down, please cheer it up');
        });
    });
});
