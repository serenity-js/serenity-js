import { expect } from '@integration/testing-tools';
import { Browser, BrowserContext, BrowserType, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { BrowseTheWeb } from '../../../src/screenplay/abilities';
import {
    browserContextStub,
    browserStub,
    browserTypeStub,
    pageStub,
} from '../../stubs/playwright';

describe('BrowseTheWeb ability', () => {
    const sandbox = createSandbox();
    let page: Page;
    let browserContext: BrowserContext;
    let browser: Browser;
    let browserType: BrowserType;
    let ability: BrowseTheWeb;

    beforeEach(() => {
        page = pageStub(sandbox);
        browserContext = browserContextStub(sandbox);
        browser = browserStub(sandbox);
        browserType = browserTypeStub(sandbox);
        (browserType.launch as SinonStub)
            .resolves(browserStub(sandbox))
            .onCall(0)
            .resolves(browser);
        (browser.newContext as SinonStub)
            .resolves(browserContextStub(sandbox))
            .onCall(0)
            .resolves(browserContext);
        (browserContext.newPage as SinonStub)
            .resolves(pageStub(sandbox))
            .onCall(0)
            .resolves(page);

        ability = BrowseTheWeb.using(browserType);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('stores browser', () => {
        expect((ability as any).browserType).to.be.equal(browserType);
    });

    it('opens page', async () => {
        const url = 'url';
        const options = { referer: '', timeout: 1, waitUntil: 'load' as const };

        await ability.open(url, options);

        expect(page.goto).to.be.called;
        expect(page.goto).to.be.calledWith(url, options);
    });

    it('returns page', async () => {
        const actualPage = await (ability as any).page();

        expect(actualPage).to.be.equal(page);
    });

    it('returns same page each time', async () => {
        const page1 = await (ability as any).page();
        const page2 = await (ability as any).page();

        expect(page1).to.be.equal(page2);
    });

    it('returns context', async () => {
        const actualContext = await ability.context();

        expect(actualContext).to.be.equal(browserContext);
    });

    it('returns same context each time', async () => {
        const context1 = await ability.context();
        const context2 = await ability.context();

        expect(context1).to.be.equal(context2);
    });

    it('closes browser', async () => {
        await ability.closeBrowser();
        expect(browser.close).to.have.been.called;
    });

    it('closes page', async () => {
        await ability.closePage();
        expect(page.close).to.have.been.called;
    });

    it('find specific element', async () => {
        const selector = 'selector';
        await ability.$(selector);
        expect(page.$).to.have.been.called;
        expect(page.$).to.have.been.calledWith(selector);
    });

    it('find several elements', async () => {
        const selector = 'selector';
        await ability.$$(selector);
        expect(page.$$).to.have.been.called;
        expect(page.$$).to.have.been.calledWith(selector);
    });

    it('clicks on selector', async () => {
        const selector = 'selector';
        await ability.click(selector);
        expect(page.click).to.have.been.called;
        expect(page.click).to.have.been.calledWith(selector);
    });

    it('double clicks on selector', async () => {
        const selector = 'selector';
        await ability.doubleClick(selector);
        expect(page.dblclick).to.have.been.called;
        expect(page.dblclick).to.have.been.calledWith(selector);
    });

    it('hovers on selector', async () => {
        const selector = 'selector';
        await ability.hover(selector);
        expect(page.hover).to.have.been.called;
        expect(page.hover).to.have.been.calledWith(selector);
    });

    it('executes function', async () => {
        const script = sandbox.stub();
        const args = [1, 'a', { a: 1 }];

        await ability.evaluate(script, args);

        expect(page.evaluate).to.have.been.called;
        expect(page.evaluate).to.have.been.calledWith(script, args);
    });

    it('takes screenshot', async () => {
        const expectedBuffer = Buffer.from('result');
        (page.screenshot as SinonStub).resolves(expectedBuffer);

        const actualBuffer = await ability.takeScreenshot();

        expect(actualBuffer).to.be.equal(expectedBuffer);
        expect(page.screenshot).to.have.been.called;
    });

    it('takes screenshot with params', async () => {
    // see playwright docs for more information about options
        const options = { fullPage: true, path: '/path/to/file' };
        await ability.takeScreenshot(options);

        expect(page.screenshot).to.have.been.called;
        expect(page.screenshot).to.have.been.calledWith(options);
    });

    it('returns page title', async () => {
        const title = 'title';
        (page.title as SinonStub).resolves(title);

        const result = await ability.getPageTitle();

        expect(result).to.be.equal(title);
    });

    it('returns current URL', async () => {
        const url = 'url';
        (page.url as SinonStub).resolves(url);

        const result = await ability.getCurrentUrl();

        expect(result).to.be.equal(url);
    });

    it('waits for timeout', async () => {
        await ability.waitForTimeout(1000);

        expect(page.waitForTimeout).to.have.been.called;
        expect(page.waitForTimeout).to.have.been.calledWith(1000);
    });

    it('waits for Event'); // not implemented
    it('waits for Function'); // not implemented
    it('waits for LoadState'); // not implemented
    it('waits for Navigation'); // not implemented
    it('waits for Request'); // not implemented
    it('waits for Response'); // not implemented
    it('waits for Selector'); // not implemented
    it('waits for URL'); // not implemented
    it('switch between tabs'); // not implemented
});
