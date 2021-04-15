const assert = require('assert');

describe('Mocha reporting', () => {

    describe('level 1 suite', () => {

        it('fails with an assertion error', () => {
            assert.strictEqual(false, true);
        });

        describe('level 2 suite', () => {

            it('passes', () => {
                // no-op, passing
            });
        });
    });
});
