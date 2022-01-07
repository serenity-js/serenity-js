import 'mocha';

import { expect } from '@integration/testing-tools';
import { BrowseTheWeb, Key } from '@serenity-js/web';
import { Browser, BrowserType, chromium, Keyboard, Page } from 'playwright';

import { BrowseTheWebWithPlaywright } from '../../../src/screenplay/abilities';

describe('BrowseTheWeb ability', () => {
    let page: Page;
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

    it('stores browser', async () => {
        expect((ability as any).browserType).to.be.equal(browserType);
    });

    it('opens page', async () => {
        const url = 'https://www.google.com/';

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
        const actualResult = await ability.executeScript((...args: any) => args, 1, 2, 3);
        expect(actualResult).to.be.deep.equal([1,2,3]);
    });

    it('can execute string script', async () => {
        const actualResult = await ability.executeScript('"mock"');
        expect(actualResult).to.be.deep.equal('mock');
    });

    it('can execute async script', async () => {
        // FIXME: I don't know how this should work
        // const mock: (...args: [...parameters: any[], callback: (result: any[]) => void]) => void = (parameters: any[], callback: (args?: any[]) => any[]) => {
        // return callback(parameters);
        // };
        // const actualResult = await ability.executeAsyncScript(mock, 1, 2, 3, (args: any) => args);
        // expect(actualResult).to.be.deep.equal([ 1, 2, 3 ]);
    });
});

