import "mocha";

import { expect } from "@integration/testing-tools";
import { Browser, BrowserContext, BrowserType, chromium, Keyboard, Page } from "playwright";
import { createSandbox } from "sinon";
import { BrowseTheWeb, Key } from '@serenity-js/web';

import { BrowseTheWebWithPlaywright } from "../../../src/screenplay/abilities";
import {PlaywrightPage} from "../../../src/screenplay/models/PlaywrightPage";

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

    it('can sen keys', async () => {
        const keys = [
            'a',
            'b',
            Key.Shift,
            'c',
            'd',
        ];
        const expectedKeys = [
            {
                key: 'a',
                method: 'press',
            },
            {
                key: 'b',
                method: 'press',
            },
            {
                key: 'Shift',
                method: 'down',
            },
            {
                key: 'c',
                method: 'press',
            },
            {
                key: 'd',
                method: 'press',
            },
            {
                key: 'Shift',
                method: 'up',
            },
        ];

        const actualKeys = [];
        page.keyboard = {
            up: (key: any) => actualKeys.push({
                method: 'up',
                key
            }),
            down: (key: any) => actualKeys.push({
                method: 'down',
                key
            }),
            press: (key: any) => actualKeys.push({
                method: 'press',
                key
            }),
        } as unknown as Keyboard;

        await ability.sendKeys(keys);

        expect(actualKeys).to.be.deep.equal(expectedKeys);
    });

    it('can execute script', async () => {
        const mock = (...args: any) => args;
        const actualResult = await ability.executeScript(mock, 1, 2, 3);
        expect(actualResult).to.be.deep.equal([1,2,3]);
    });

    it('can execute string script', async () => {
        const actualResult = await ability.executeScript('"mock"');
        expect(actualResult).to.be.deep.equal('mock');
    });

    it('can execute async script', async () => {
        // FIXME: I don't know how this should work
        // const mock = (parameters: any[], callback: (args?: any[]) => any[]) => {
            // return callback(parameters);
        // };
        // const actualResult = await ability.executeAsyncScript(mock, [ 1, 2, 3 ], (args) => args);
        // expect(actualResult).to.be.deep.equal([ 1, 2, 3 ]);
    });

    it('can return cookie');
    it('can set cookie');
    it('can delete all cookies');
    it('can return modal dialog');
    it('can return last script execution result');
    it('can take a screenshot');
    it('can swtch to frame');
    it('can switch to parent frame');
    it('can switch to default content');
});

