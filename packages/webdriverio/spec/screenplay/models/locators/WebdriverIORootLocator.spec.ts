import { expect } from '@integration/testing-tools';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { WebdriverIORootLocator } from '../../../../src/screenplay/models/locators/WebdriverIORootLocator.js';

describe('WebdriverIORootLocator', () => {

    const outerFrame = { selector: 'iframe#outer' } as unknown as WebdriverIO.Element;
    const innerFrame = { selector: 'iframe#inner' } as unknown as WebdriverIO.Element;

    let browser: {
        isBidi: boolean,
        switchFrame: sinon.SinonStub,
        switchToParentFrame: sinon.SinonStub,
    };

    let locator: WebdriverIORootLocator;

    function browserWith(options: { isBidi: boolean }) {
        browser = {
            isBidi:                 options.isBidi,
            switchFrame:            sinon.stub().resolves(),
            switchToParentFrame:    sinon.stub().resolves(),
        };

        return new WebdriverIORootLocator(browser as unknown as WebdriverIO.Browser);
    }

    describe('when using WebDriver BiDi', () => {

        // WebdriverIO 9 updates its internal browsing context asynchronously after switchToParentFrame,
        // so a command issued straight afterwards might still run in the frame the browser has just left.
        // The locator avoids switchToParentFrame and instead re-enters the frames above the current one.

        beforeEach(() => {
            locator = browserWith({ isBidi: true });
        });

        it('switches to the parent frame by re-entering the frames above the current one', async () => {
            await locator.switchToFrame(outerFrame);
            await locator.switchToFrame(innerFrame);

            browser.switchFrame.resetHistory();

            await locator.switchToParentFrame();

            expect(browser.switchToParentFrame).to.not.have.been.called;
            expect(browser.switchFrame.args).to.deep.equal([
                [ null ],
                [ outerFrame ],
            ]);
        });

        it('switches to the top-level browsing context when leaving the outermost frame', async () => {
            await locator.switchToFrame(outerFrame);
            await locator.switchToFrame(innerFrame);

            await locator.switchToParentFrame();

            browser.switchFrame.resetHistory();

            await locator.switchToParentFrame();

            expect(browser.switchToParentFrame).to.not.have.been.called;
            expect(browser.switchFrame.args).to.deep.equal([
                [ null ],
            ]);
        });

        it('forgets the frames it has entered when switching to the main frame', async () => {
            await locator.switchToFrame(outerFrame);
            await locator.switchToFrame(innerFrame);

            await locator.switchToMainFrame();
            await locator.switchToParentFrame();

            // nothing to re-enter, so it lets WebdriverIO handle the switch
            expect(browser.switchToParentFrame).to.have.been.calledOnce;
        });

        it('lets WebdriverIO switch to the parent frame when it did not enter the current frame itself', async () => {
            await locator.switchToParentFrame();

            expect(browser.switchToParentFrame).to.have.been.calledOnce;
        });
    });

    describe('when using WebDriver Classic', () => {

        beforeEach(() => {
            locator = browserWith({ isBidi: false });
        });

        it('lets WebdriverIO switch to the parent frame', async () => {
            await locator.switchToFrame(outerFrame);
            await locator.switchToFrame(innerFrame);

            browser.switchFrame.resetHistory();

            await locator.switchToParentFrame();

            expect(browser.switchToParentFrame).to.have.been.calledOnce;
            expect(browser.switchFrame).to.not.have.been.called;
        });
    });
});
