import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { ElementHandle, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { isClickable, isEnabled, isVisible } from '../../src/expectations/is';
import { BrowseTheWeb } from '../../src/screenplay/abilities';
import { by, Target } from '../../src/screenplay/questions/targets';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../stubs/playwright';

const { the } = Target;

describe('Ensure element is', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.$ = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    it('visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await actor.attemptsTo(
            Ensure.that(the('visible element').located(by.id('selector')), isVisible())
        );
    });

    it('not visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor
            .attemptsTo(
                Ensure.that(the('hidden element').located(by.id('selector')), isVisible())
            ))
            .to.be.rejectedWith('Expected the hidden element to be visible');
    });

    it('enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor.attemptsTo(
            Ensure.that(the('enabled element').located(by.id('selector')), isEnabled())
        )).to.be.fulfilled;
    });

    it('not enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (selectedElementHandle.isEnabled as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor
            .attemptsTo(
                Ensure.that(the('disabled element').located(by.id('selector')), isEnabled())
            ))
            .to.be.rejectedWith('Expected the disabled element to be enabled');
    });

    it('enabled, but invisible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor
            .attemptsTo(
                Ensure.that(the('disabled element').located(by.id('selector')), isEnabled())
            ))
            .to.be.rejectedWith('Expected the disabled element to be visible');
    });

    it('clickable', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor.attemptsTo(
            Ensure.that(
                the('not clickable element').located(by.id('selector')),
                isClickable()
            )
        )).to.be.fulfilled;
    });

    it('not clickable, because not enabled', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(false);
        (selectedElementHandle.isVisible as SinonStub).resolves(true);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor
            .attemptsTo(
                Ensure.that(
                    the('not clickable element').located(by.id('selector')),
                    isClickable()
                )
            ))
            .to.be.rejectedWith(
                'Expected the not clickable element to be enabled'
            );
    });

    it('not clickable, because not visible', async () => {
        const selectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (selectedElementHandle.isEnabled as SinonStub).resolves(true);
        (selectedElementHandle.isVisible as SinonStub).resolves(false);
        (browseTheWeb.$ as SinonStub).resolves(selectedElementHandle);
        await expect(actor
            .attemptsTo(
                Ensure.that(
                    the('not clickable element').located(by.id('selector')),
                    isClickable()
                )
            ))
            .to.be.rejectedWith(
                'Expected the not clickable element to be visible'
            );
    });
});

describe('Non existing element', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.$ = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
        // eslint-disable-next-line unicorn/no-null
        (browseTheWeb.$ as SinonStub).resolves(null);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    it('is not visible', async () => {
        await expect(actor
            .attemptsTo(
                Ensure.that(
                    the('non exsting element').located(by.id('selector')),
                    isVisible()
                )
            ))
            .to.be.rejectedWith('Expected the non exsting element to be visible');
    });

    it('is not enabled', async () => {
        await expect(actor
            .attemptsTo(
                Ensure.that(
                    the('non exsting element').located(by.id('selector')),
                    isEnabled()
                )
            ))
            .to.be.rejectedWith('Expected the non exsting element to be visible');
    });

    it('is not clickable', async () => {
        await expect(actor
            .attemptsTo(
                Ensure.that(
                    the('non exsting element').located(by.id('selector')),
                    isClickable()
                )
            ))
            .to.be.rejectedWith('Expected the non exsting element to be visible');
    });
});
