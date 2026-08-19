import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Mocha', () => {

    describe('Worker B', () => {

        it('passes test B1', () => {
            // no-op
        });

        it('fails test B2', () => {
            assert.equal(false, true, 'Expected false to be true.');
        });
    });
});
