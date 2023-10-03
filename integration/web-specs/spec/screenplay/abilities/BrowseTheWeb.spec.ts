import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';

describe('BrowseTheWeb', () => {

    it('follows the naming convention of BrowseTheWebWith<integrationToolName>', () => {
        const browseTheWeb = BrowseTheWeb.as(actorCalled('Bernie'));

        expect(browseTheWeb.constructor.name).to.match(/^BrowseTheWebWith.*/);
    });
});
