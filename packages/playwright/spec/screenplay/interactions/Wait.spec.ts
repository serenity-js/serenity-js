import {
    Actor,
    actorCalled,
    Duration,
    serenity,
} from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import chaiExclude from 'chai-exclude';
import { Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { isPresent, isVisible } from '../../../src/expectations';
import {
    ElementHandleExpectation,
} from '../../../src/expectations/ElementHandleExpectation';
import { by, Target, Wait } from '../../../src/screenplay';
import { BrowseTheWeb } from '../../../src/screenplay/abilities';
import { chai } from '../../chai-extra';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../../stubs/playwright';

chai.use(chaiExclude);

const { expect } = chai;

describe("'Wait' interaction", () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.waitForTimeout = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    describe('can wait for duration of', () => {
        it('5 seconds', () => {
            const action = Wait.for(Duration.ofSeconds(5));
            action.performAs(actor);

            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.called;
            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.calledWith(
                5000
            );
        });

        it('5000 milliseconds', () => {
            const action = Wait.for(Duration.ofMilliseconds(5000));
            action.performAs(actor);

            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.called;
            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.calledWith(
                5000
            );
        });

        it('1 minute', () => {
            const action = Wait.for(Duration.ofMinutes(1));
            action.performAs(actor);

            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.called;
            expect((browseTheWeb.waitForTimeout as SinonStub)).to.have.been.calledWith(
                60000
            );
        });
    });

    describe('can wait until element is', () => {
        it('attached', async () => {
            (page.waitForSelector as SinonStub).resolves(null);

            await expect(actor
                    .attemptsTo(Wait.until(Target.$(by.id('example')), isPresent())))
                .to.be.rejectedWith('Expected id=example to be attached');
        });

        it('visible', async () => {
            const elementHandle = elementHandleStub(sandbox);
            (elementHandle.isVisible as SinonStub).resolves(false);
            (page.waitForSelector as SinonStub).resolves(elementHandle);

            await expect(actor
                    .attemptsTo(Wait.until(Target.$(by.id('example')), isVisible())))
                .to.be.rejectedWith('Expected id=example to be visible');
        });

        [
            {
                expectationResult: true,
                promiseResult: 'fulfilled',
            },
            {
                expectationResult: false,
                promiseResult: 'rejected',
            },
        ].forEach(({ expectationResult, promiseResult }) => {
            it('in specific state', async () => {
                const element = elementHandleStub(sandbox);
                const target = Target.$(by.id('example'));
                target.whichShouldBecome = sandbox.stub().returns(target);
                target.answeredBy = sandbox.stub().resolves(element);
                const isReady = ElementHandleExpectation.forElementToBe(
                    'attached',
                    async () => expectationResult
                );

                await expect(actor.attemptsTo(Wait.until(target, isReady))).to.be[
            promiseResult
                ];
                expect(target.whichShouldBecome).to.have.been.called;
                expect(target.whichShouldBecome).to.have.been.calledWith(isReady);
            });
        });
    });
});
