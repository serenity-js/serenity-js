import { Actor, actorCalled } from '@serenity-js/core';
import chaiExclude from 'chai-exclude';
import { Page } from 'playwright';
import { createSandbox } from 'sinon';

import { BrowseTheWeb } from '../../../src/screenplay';
import { Target } from '../../../src/screenplay/questions/targets';
import { chai } from '../../chai-extra';
import { browserTypeStub, pageStub } from '../../stubs/playwright';

chai.use(chaiExclude);
chai.should();

const { expect } = chai;

const { todo } = test;

const { the } = Target;

describe("'Click' interaction", () => {
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

    // Seems to be checked implicitly by playwright
    todo('ensures the element is clickable');
    // it("ensures the element is clickable", async () => {
    //   (page.$ as SinonStub).resolves(null);

    //   await actor
    //     .attemptsTo(Click.on(the("non exsiting element").selectedBy("selector")))
    //     .should.be.rejectedWith(
    //       "Expected the non exsiting element to be visible"
    //     );
    // });
});
