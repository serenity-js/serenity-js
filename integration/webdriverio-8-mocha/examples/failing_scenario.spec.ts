import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Mocha', () => {

    describe('A scenario', () => {

        it('fails', () => {
            browser.$$('#search-results li').filter

            assert.equal(false, true, 'Expected false to be true.');
        });
    });
});
