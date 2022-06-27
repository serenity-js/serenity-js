/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';

/** @test {BrowseTheWeb} */
describe('BrowseTheWeb', () => {

    /** @test {BrowseTheWeb} */
    /** @test {BrowseTheWeb.as} */
    it('follows the naming convention of BrowseTheWebWith<integrationToolName>', () => {
        const browseTheWeb = BrowseTheWeb.as(actorCalled('Bernie'));

        expect(browseTheWeb.constructor.name).to.match(/^BrowseTheWebWith.*/);
    });
});
