import { describe } from 'mocha';
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

        it('is pending');

        it.skip('is skipped', function () {
            // no-op
        });

        it('is skipped programmatically', function () {
            this.skip();
        });

        let counter = 2;
        it('is retried', function () {
            this.retries(2);

            if (counter > 0) {
                counter--;
                throw new Error('Failed, to be retried');
            }
        });

        it('is compromised', () => {
            throw new TestCompromisedError('The server is down, please cheer it up');
        });
    });
});
