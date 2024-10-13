import 'mocha';

import { expect } from '@integration/testing-tools';
import { browser } from '@wdio/globals';

describe('WebdriverIO', () => {

    describe('automationProtocol', () => {

        it('correctly sets the isDevTools flag', () => {

            expect(browser.options.automationProtocol).to.be.oneOf(['devtools', 'webdriver']);

            if (browser.options.automationProtocol === 'devtools') {
                expect(browser.isDevTools).to.equal(true);
            }
            else {
                expect(browser.isDevTools).to.equal(undefined);
            }
        });
    });
});

