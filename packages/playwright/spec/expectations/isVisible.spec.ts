import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, by, Close, isVisible, Target } from '../../src';

const { the } = Target;

describe('isVisible expectation', () => {
    const actor = actorCalled('Mike').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (
            actor.abilityTo(BrowseTheWeb) as any
        ).page();
        page.setContent(`
        <html>
            <div id="exist">I exist</div>
            <div id="invisible" style="display: none">I am invisible</div>
        </html>`);
    });

    afterEach(() => {
        serenity.announce(new TestRunFinishes());
    });

    after(async () => {
        await actor.attemptsTo(Close.browser());
    });

    it('resolves when element exists', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('existing element').located(by.id('exist')),
                isVisible(),
            ),
        )).to.eventually.be.fulfilled;
    });

    it('rejects when element is invisible', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('invisible element').located(by.id('invisible')),
                isVisible(),
            ),
        )).to.eventually.be.rejectedWith('element to be visible');
    });

    it('rejects when element does not exists', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('non-existent element').located(by.id('non-existent')),
                isVisible(),
            ),
        )).to.eventually.be.rejectedWith('element to be visible');
    });
});