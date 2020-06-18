const assert = require('assert');

describe('Mocha', () => {

    describe('A scenario', () => {

        it('fails', () => {
            assert.equal(false, true, 'Expected false to be true.');
        });
    });
});
