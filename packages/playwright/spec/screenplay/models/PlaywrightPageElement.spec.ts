import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, actorCalled } from '@serenity-js/core';

import { Browser, chromium, Page,  } from 'playwright';
import { BrowseTheWebWithPlaywright } from '../../../src';

import { PlaywrightPageElement } from '../../../src/screenplay/models/PlaywrightPageElement';


describe('PlaywrightPageElement', () => {
    let browser: Browser;
    let page: Page;
    let actor: Actor;
    let ability: BrowseTheWebWithPlaywright;

    before(async () => {
        actor = actorCalled('Jimmy').whoCan(BrowseTheWebWithPlaywright.using(chromium));
        ability = actor.abilityTo(BrowseTheWebWithPlaywright);
        browser = await (ability as any).browser();
    })

    beforeEach(async () => {
        page = await (ability as any).page();
    });

    afterEach(async () => {
        await (ability as any).closePage();
    });

    after(async () => {
        await browser.close();
    });

    it('can enter and clear value', async () => {
        const expectedValue = 'entered value';
        await page.setContent("<input id='test-input'></input>");
        const element = await PlaywrightPageElement.locatedById('test-input').answeredBy(actor);
        await element.enterValue(expectedValue);
        let text = await (await page.$('id=test-input')).inputValue();
        expect(text).to.be.equal(expectedValue);

        await element.clearValue();
        text = await (await page.$('id=test-input')).inputValue();
        expect(text).to.be.equal('');
    });

    it('can click', async () => {
        await page.setContent(`
            <html>
                <button
                        id="to-hide"
                        onclick="
                                document.getElementById('to-hide').style.display = 'none';"
                >
                    Click me!
                </button>
            </html>`
        );
        const element = await PlaywrightPageElement.locatedById('to-hide').answeredBy(actor);
        await element.click();
        expect(await page.$('id=to=hide')).to.be.null;
    });

    it('can double click');
    it('can scroll into view');
    it('can hover over');
    it('can right click');
    it('can return attribute');
    it('can can return text');
    it('can return value');
    it('can return isActive');
    it('can return isClickable');
    it('can return isDisplayed');
    it('can return isEnabled');
    it('can return isPresent');
    it('can return isSelected');
    it('can be a child of another element');
});
