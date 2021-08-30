import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, actorCalled, Duration, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';
import { createSandbox } from 'sinon';

import { by, isPresent, isVisible, Target } from '../../../src';
import { Wait } from '../../../src/screenplay';
import { BrowseTheWeb } from '../../../src/screenplay/abilities';

describe('\'Wait\' interaction', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(chromium);
        actor = actorCalled('Actor').whoCan(browseTheWeb);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    after(async () => {
        await browseTheWeb.closeBrowser();
    });

    describe('can wait for duration of', () => {
        it('5 seconds', async () => {
            const waitForTimeout = sandbox.stub(browseTheWeb, 'waitForTimeout');

            await actor.attemptsTo(Wait.for(Duration.ofSeconds(5)));

            expect(waitForTimeout).to.have.been.called;
            expect(waitForTimeout).to.have.been.calledWith(
                5000,
            );
        });

        it('5000 milliseconds', async () => {

            const waitForTimeout = sandbox.stub(browseTheWeb, 'waitForTimeout');

            await actor.attemptsTo(Wait.for(Duration.ofMilliseconds(5000)));

            expect(waitForTimeout).to.have.been.called;
            expect(waitForTimeout).to.have.been.calledWith(
                5000,
            );
        });

        it('1 minute', async () => {
            const waitForTimeout = sandbox.stub(browseTheWeb, 'waitForTimeout');

            await actor.attemptsTo(Wait.for(Duration.ofMinutes(1)));

            expect(waitForTimeout).to.have.been.called;
            expect(waitForTimeout).to.have.been.calledWith(
                60000,
            );
        });
    });

    describe('can wait until element is', () => {
        let page: Page;

        beforeEach(async () => {
            page =
                await (
                    browseTheWeb as any
                ).page();
        });

        it('attached', async () => {
            sandbox.stub(page, 'waitForSelector').resolves(null);

            await expect(actor
                .attemptsTo(Wait.until(Target.$(by.id('example')), isPresent())))
                .to.be.rejectedWith(`Expected ${by.id('example').toString()} to be attached`);
        });

        it('visible', async () => {
            page.setContent(`
                <div id="hidden" style="display: none">Hidden</div>
            `);

            const selector = by.id('hidden');
            await expect(actor
                .attemptsTo(Wait.until(Target.$(selector), isVisible())
                    .withOptions({ timeout: 5 })))
                .to.be.rejected;
        });
    });
});
