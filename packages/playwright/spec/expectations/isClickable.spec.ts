import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, by, Close, isClickable, Target } from '../../src';

const { the } = Target;

describe('isClickable expectation', () => {
    const actor = actorCalled('Mike').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (
            actor.abilityTo(BrowseTheWeb) as any
        ).page();
        page.setContent(`
        <html>
            <button id="disabled" disabled>I am disabled</button>
            <button id="enabled">I am enabled</button>
            <button id="invisible" style="display: none">I am invisible</button>
        </html>`);
    });

    afterEach(() => {
        serenity.announce(new TestRunFinishes());
    });

    after(async () => {
        await actor.attemptsTo(Close.browser());
    });

    it('resolves when element enabled', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('enabled element').located(by.id('enabled')),
                isClickable(),
            ),
        )).to.eventually.be.fulfilled;
    });

    it('rejects when element exists, but disabled', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('disabled element').located(by.id('disabled')),
                isClickable(),
            ),
        )).to.eventually.be.rejectedWith('element to be enabled');
    });

    it('rejects when element exists, even invisible', async () => {
        await expect(actor.attemptsTo(
            Ensure.that(
                the('invisible element').located(by.id('invisible')),
                isClickable(),
            ),
        )).to.eventually.be.rejectedWith('element to be visible');
    });
});