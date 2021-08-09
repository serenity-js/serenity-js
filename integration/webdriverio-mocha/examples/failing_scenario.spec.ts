import 'mocha';

import * as assert from 'assert';

describe('Mocha', () => {

    describe('A scenario', () => {

        it('fails', () => {
            assert.equal(false, true, 'Expected false to be true.');
        });
    });
});
