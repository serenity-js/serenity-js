import "mocha";

import { expect } from "@integration/testing-tools";
import { Browser, BrowserContext, BrowserType, chromium, Page } from "playwright";
import { createSandbox } from "sinon";
import { BrowseTheWeb } from '@serenity-js/web';

import { BrowseTheWebWithPlaywright } from "../../../src/screenplay/abilities";

describe("BrowseTheWeb ability", () => {
    const sandbox = createSandbox();
    let page: Page;
    let browserContext: BrowserContext;
    let browser: Browser;
    let browserType: BrowserType;
    let ability: BrowseTheWeb;

    before(async () => {
        browserType = chromium;

        ability = BrowseTheWebWithPlaywright.using(browserType);
        browser = await (ability as any).browser();
    });

    beforeEach(async () => {
        page = await (ability as any).page();
    });

    afterEach(async () => {
        page = await (ability as any).page();
        // await ability.closePage();
        // expect(page.isClosed()).to.be.true;
    });

    after(async () => {
        await browser.close();
        // expect(browser.isConnected()).to.be.false;
    });

    it("stores browser", async () => {
        expect((ability as any).browserType).to.be.equal(browserType);
    });

    it("opens page", async () => {
        const url = "https://www.google.com/";

        await ability.navigateTo(url);

        page = await (ability as any).page();

        expect(page.url()).to.be.equal(url);
    });

    it("find specific element", async () => {
        await page.setContent("<input id='test-input'></input>");
        const selector = "input";
        const expected = await page.$(selector);

        // const actual = await ability.$(selector);

        // expect(await actual.getAttribute("id")).to.be.deep.equal(await expected.getAttribute("id"));
    });
//
//    it("find several elements", async () => {
//        await page.setContent("<ul id='test-ul'>" +
//            "<li id='1'></li>" +
//            "<li id='2'></li>" +
//            "<li id='3'></li>" +
//            "</ul>");
//        const selector = "li";
//        const expected = await page.$$(selector);
//
//        const actual = await ability.$$(selector);
//
//        expect(actual.length).to.be.deep.equal(expected.length);
//        const expectedIds = await Promise.all(expected.map((eh) => eh.getAttribute("id")));
//        const actualIds = await Promise.all(actual.map((eh) => eh.getAttribute("id")));
//        expect(actualIds).to.be.deep.equal(expectedIds);
//    });
//
//    it("clicks on selector", async () => {
//        await page.setContent(`
//            <button
//                    id="to-hide"
//                    onclick="
//                            document.getElementById('to-hide').style.display = 'none';"
//            >
//                Click me!
//            </button>
//        `);
//        const selector = "id=to-hide";
//        let element = await page.$(selector);
//        await expect(element.isVisible()).to.eventually.be.equal(true);
//
//        await ability.click(selector);
//
//        element = await page.$(selector);
//        await expect(element.isVisible()).to.eventually.be.equal(false);
//    });
//
//    it("double clicks on selector", async () => {
//        await page.setContent(`
//            <button
//                    id="to-hide"
//                    ondblclick="
//                            document.getElementById('to-hide').style.display = 'none';"
//            >
//                Click me!
//            </button>
//        `);
//        const selector = "id=to-hide";
//        let element = await page.$(selector);
//        await expect(element.isVisible()).to.eventually.be.equal(true);
//
//        await ability.doubleClick(selector);
//
//        element = await page.$(selector);
//        await expect(element.isVisible()).to.eventually.be.equal(false);
//    });
//
//    it("hovers on selector", async () => {
//        await page.setContent(`
//            <button
//                    id="to-hover"
//                    onmouseover="
//                            document.getElementById('to-hide').style.display = 'none';"
//            >
//                Click me!
//            </button>
//            <div id="to-hide">I'm hiding</div>
//        `);
//        const selector = "id=to-hover";
//        const selectorToHide = "id=to-hide";
//        let element = await page.$(selectorToHide);
//        await expect(element.isVisible()).to.eventually.be.equal(true);
//
//        await ability.hover(selector);
//
//        element = await page.$(selectorToHide);
//        await expect(element.isVisible()).to.eventually.be.equal(false);
//    });
//
//    it("executes function", async () => {
//        const evalStub = sandbox.stub(page, "evaluate");
//
//        const script = sandbox.stub();
//        const args = [1, "a", {a: 1}];
//
//        await ability.evaluate(script, args);
//
//        expect(evalStub).to.have.been.called;
//        expect(evalStub).to.have.been.calledWith(script, args);
//    });
//
//    it("takes screenshot", async () => {
//        const expectedBuffer = Buffer.from("result");
//        const screenshot = sandbox.stub(page, "screenshot").resolves(expectedBuffer);
//
//        const actualBuffer = await ability.takeScreenshot();
//
//        expect(actualBuffer).to.be.equal(expectedBuffer);
//        expect(screenshot).to.have.been.called;
//    });
//
//    it("takes screenshot with params", async () => {
//        const screenshot = sandbox.stub(page, "screenshot");
//
//        // see playwright docs for more information about options
//        const options = {fullPage: true, path: "/path/to/file"};
//        await ability.takeScreenshot(options);
//
//        expect(screenshot).to.have.been.called;
//        expect(screenshot).to.have.been.calledWith(options);
//    });
//
//    it("returns page title", async () => {
//        const title = "title";
//        sandbox.stub(page, "title").resolves(title);
//
//        const result = await ability.getPageTitle();
//
//        expect(result).to.be.equal(title);
//    });
//
//    it("returns current URL", async () => {
//        const url = "url";
//        sandbox.stub(page, "url").resolves(url);
//
//        const result = await ability.getCurrentUrl();
//
//        expect(result).to.be.equal(url);
//    });
//
//    it("waits for timeout", async () => {
//        const waitForTimeout = sandbox.stub(page, "waitForTimeout");
//
//        await ability.waitForTimeout(1000);
//
//        expect(waitForTimeout).to.have.been.called;
//        expect(waitForTimeout).to.have.been.calledWith(1000);
//    });
//
//    it("waits for Event"); // not implemented
//    it("waits for Function"); // not implemented
//    it("waits for LoadState"); // not implemented
//    it("waits for Navigation"); // not implemented
//    it("waits for Request"); // not implemented
//    it("waits for Response"); // not implemented
//    it("waits for Selector"); // not implemented
//    it("waits for URL"); // not implemented
//    it("switch between tabs"); // not implemented
});
