import { Browser, BrowserContext, BrowserType, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { BrowseTheWeb } from '../../../src/screenplay/abilities';
import { chai } from '../../chai-extra';
import {
    browserContextStub,
    browserStub,
    browserTypeStub,
    pageStub,
} from '../../stubs/playwright';

chai.should();
const { expect } = chai;

const { todo } = test;

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
        (ability as any).browserType.should.be.equal(browserType);
    });

    it('opens page', async () => {
        const url = 'url';
        const options = { referer: '', timeout: 1, waitUntil: 'load' as const };

        await ability.open(url, options);

        page.goto.should.be.called;
        page.goto.should.be.calledWith(url, options);
    });

    it('returns page', async () => {
        const actualPage = await (ability as any).page();

        actualPage.should.be.equal(page);
    });

    it('returns same page each time', async () => {
        const page1 = await (ability as any).page();
        const page2 = await (ability as any).page();

        page1.should.be.equal(page2);
    });

    it('returns context', async () => {
        const actualContext = await ability.context();

        actualContext.should.be.equal(browserContext);
    });

    it('returns same context each time', async () => {
        const context1 = await ability.context();
        const context2 = await ability.context();

        context1.should.be.equal(context2);
    });

    it('closes browser', async () => {
        await ability.closeBrowser();
        browser.close.should.have.been.called;
    });

    it('closes page', async () => {
        await ability.closePage();
        page.close.should.have.been.called;
    });

    it('find specific element', async () => {
        const selector = 'selector';
        await ability.$(selector);
        page.$.should.have.been.called;
        page.$.should.have.been.calledWith(selector);
    });

    it('find several elements', async () => {
        const selector = 'selector';
        await ability.$$(selector);
        page.$$.should.have.been.called;
        page.$$.should.have.been.calledWith(selector);
    });

    it('clicks on selector', async () => {
        const selector = 'selector';
        await ability.click(selector);
        page.click.should.have.been.called;
        page.click.should.have.been.calledWith(selector);
    });

    it('double clicks on selector', async () => {
        const selector = 'selector';
        await ability.doubleClick(selector);
        page.dblclick.should.have.been.called;
        page.dblclick.should.have.been.calledWith(selector);
    });

    it('hovers on selector', async () => {
        const selector = 'selector';
        await ability.hover(selector);
        page.hover.should.have.been.called;
        page.hover.should.have.been.calledWith(selector);
    });

    it('executes function', async () => {
        const script = sandbox.stub();
        const args = [1, 'a', { a: 1 }];

        await ability.evaluate(script, args);

        page.evaluate.should.have.been.called;
        page.evaluate.should.have.been.calledWith(script, args);
    });

    it('takes screenshot', async () => {
        const expectedBuffer = Buffer.from('result');
        (page.screenshot as SinonStub).resolves(expectedBuffer);

        const actualBuffer = await ability.takeScreenshot();

        expect(actualBuffer).to.be.equal(expectedBuffer);
        page.screenshot.should.have.been.called;
    });

    it('takes screenshot with params', async () => {
    // see playwright docs for more information about options
        const options = { fullPage: true, path: '/path/to/file' };
        await ability.takeScreenshot(options);

        page.screenshot.should.have.been.called;
        page.screenshot.should.have.been.calledWith(options);
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

        page.waitForTimeout.should.have.been.called;
        page.waitForTimeout.should.have.been.calledWith(1000);
    });

    todo('waits for Event'); // not implemented
    todo('waits for Function'); // not implemented
    todo('waits for LoadState'); // not implemented
    todo('waits for Navigation'); // not implemented
    todo('waits for Request'); // not implemented
    todo('waits for Response'); // not implemented
    todo('waits for Selector'); // not implemented
    todo('waits for URL'); // not implemented
    todo('switch between tabs'); // not implemented
});
