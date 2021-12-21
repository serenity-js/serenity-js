import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, actorCalled } from '@serenity-js/core';

import { Browser, chromium, Page } from 'playwright';
import { BrowseTheWebWithPlaywright } from '../../../src';

import { PlaywrightPageElements } from '../../../src';
import { PageElements } from '@serenity-js/web';


describe('PlaywrightPageElements', () => {
    let browser: Browser;
    let page: Page;
    let actor: Actor;
    let ability: BrowseTheWebWithPlaywright;
    let elements: PageElements<any, any, any>;

    before(async () => {
        actor = actorCalled('Quentin').whoCan(BrowseTheWebWithPlaywright.using(chromium));
        ability = actor.abilityTo(BrowseTheWebWithPlaywright);
        browser = await (ability as any).browser();
    })

    beforeEach(async () => {
        page = await (ability as any).page();
        await page.setContent(`
            <html>
                <div id="person-1" class="character" data-name="Heisenberg"
                    onclick="
                        document.getElementById('person-1').style.display = 'none'
                    "
                >Walter</div>
                <div id="person-2" class="character" data-name="Quentin"
                    onclick="
                        document.getElementById('person-2').style.display = 'none'
                    "
                >Jimmy</div>
                <div id="person-3" class="character" data-name="Tim"
                    onclick="
                        document.getElementById('person-3').style.display = 'none'
                    "
                >Orange</div>
            </html>`
        );
        elements = await PlaywrightPageElements.locatedByCss('.character').answeredBy(actor);
    });

    afterEach(async () => {
        await (ability as any).closePage();
    });

    after(async () => {
        await browser.close();
    });

    it('can count elements', async () => {
        expect(await elements.count()).to.be.equal(3);
    });

    it('can return first element', async () => {
        const firstElement = await elements.first();
        expect(await firstElement.attribute('id')).to.be.equal('person-1');
    });

    it('can return last element', async () => {
        const lastElement = await elements.last();
        expect(await lastElement.attribute('id')).to.be.equal('person-3');
    });

    it('can return specific element', async () => {
        const lastElement = await elements.get(1);
        expect(await lastElement.attribute('id')).to.be.equal('person-2');
    });

    it('can apply mapping function', async () => {
        const names = await elements.map((el) => el.attribute('data-name'));
        expect(names).to.be.deep.equal([
            'Heisenberg', 'Quentin', 'Tim'
        ]);
    });

    it('can filter elements', async () => {
        const filtered = elements.filter(async (el) => 'Heisenberg' === await el.attribute('data-name'));
        expect(await filtered.count()).to.be.equal(1);
        const firstElement = await elements.first();
        expect(await firstElement.attribute('id')).to.be.equal('person-1');
    });

    it('can execute function for each element', async () => {
        await elements.forEach((el) => {
            return el.click();
        });
        const isDisplayed = await elements.map((el) => el.isDisplayed());
        expect(isDisplayed).to.be.deep.equal([
            false, false, false
        ]);
    });
});

