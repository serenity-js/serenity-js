const assert = require('assert');

describe('Mocha reporting', () => {

    describe('A scenario', () => {

        it('fails when the assertion fails', () => {
            assert.strictEqual(false, true);
        });
    });
});
