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
import { Target, Wait } from '../../../src/screenplay';
import { BrowseTheWeb } from '../../../src/screenplay/abilities';
import { chai } from '../../chai-extra';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../../stubs/playwright';

chai.use(chaiExclude);
chai.should();

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

            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.called;
            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.calledWith(
                5000
            );
        });

        it('5000 milliseconds', () => {
            const action = Wait.for(Duration.ofMilliseconds(5000));
            action.performAs(actor);

            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.called;
            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.calledWith(
                5000
            );
        });

        it('1 minute', () => {
            const action = Wait.for(Duration.ofMinutes(1));
            action.performAs(actor);

            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.called;
            (browseTheWeb.waitForTimeout as SinonStub).should.have.been.calledWith(
                60000
            );
        });
    });

    describe('can wait until element is', () => {
        it('attached', async () => {
            (page.waitForSelector as SinonStub).resolves(null);

            await actor
        .attemptsTo(Wait.until(Target.$('selector'), isPresent()))
        .should.be.rejectedWith('Expected selector to be attached');
        });

        it('visible', async () => {
            const elementHandle = elementHandleStub(sandbox);
            (elementHandle.isVisible as SinonStub).resolves(false);
            (page.waitForSelector as SinonStub).resolves(elementHandle);

            await actor
        .attemptsTo(Wait.until(Target.$('selector'), isVisible()))
        .should.be.rejectedWith('Expected selector to be visible');
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
                const target = Target.$('selector');
                target.whichShouldBecome = sandbox.stub().returns(target);
                target.answeredBy = sandbox.stub().resolves(element);
                const isReady = ElementHandleExpectation.forElementToBe(
                    'attached',
                    async () => expectationResult
                );

                await actor.attemptsTo(Wait.until(target, isReady)).should.be[
            promiseResult
                ];
                target.whichShouldBecome.should.have.been.called;
                target.whichShouldBecome.should.have.been.calledWith(isReady);
            });
        });
    });
});
