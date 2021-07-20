import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import chaiExclude from 'chai-exclude';
import { ElementHandle, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { isPresent, isVisible } from '../../../../src/expectations';
import { BrowseTheWeb } from '../../../../src/screenplay/abilities';
import { TargetElement } from '../../../../src/screenplay/questions/targets/TargetElement';
import { chai } from '../../../chai-extra';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../../../stubs/playwright';

chai.use(chaiExclude);
chai.should();

const { expect } = chai;

const { todo } = test;

describe('TargetElement Question', () => {
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

    it('element is selected by passed selector', async () => {
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (browseTheWeb.$ as SinonStub).resolves(expectedElementHandle);

        await actor.answer(TargetElement.at('selector'));

        (browseTheWeb.$ as SinonStub).should.have.been.calledWith('selector');
    });

    it('can be answered with element', async () => {
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (browseTheWeb.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('selector')
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(actualElementHandle)
      .excluding('toString')
      .excluding('isExisting')
      .to.be.deep.equal(expectedElementHandle);
    });

    it('overrides description for the answer', async () => {
        const expectedDescription = 'real description';
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        expectedElementHandle.toString = sandbox.stub().returns('fake string');
        (browseTheWeb.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('selector').as(expectedDescription)
        );

        expect(actualElementHandle.toString()).to.be.equal(
            `${expectedDescription}`
        );
    });

    it('can be a MetaQuestion to return child of a parent', async () => {
        const expectedParent: ElementHandle = elementHandleStub(sandbox);
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (browseTheWeb.$ as SinonStub).resolves(expectedParent);
        (expectedParent.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('child selector').of(TargetElement.at('parent selector'))
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(actualElementHandle)
      .excluding('toString')
      .excluding('isExisting')
      .to.be.deep.equal(expectedElementHandle);
    });

    it('adds information about parent to the description', async () => {
        const expectedParent: ElementHandle = elementHandleStub(sandbox);
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (browseTheWeb.$ as SinonStub).resolves(expectedParent);
        (expectedParent.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('child selector')
        .as('child')
        .of(TargetElement.at('parent selector').as('parent'))
        );

        actualElementHandle.toString().should.be.equal('child of parent');
    });

    it('adds information about all parents in the hierarchy to the description', async () => {
        const expectedGrandParent: ElementHandle = elementHandleStub(sandbox);
        const expectedParent: ElementHandle = elementHandleStub(sandbox);
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        (browseTheWeb.$ as SinonStub).resolves(expectedGrandParent);
        (expectedGrandParent.$ as SinonStub).resolves(expectedParent);
        (expectedParent.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('child selector')
        .as('child')
        .of(
            TargetElement.at('parent selector')
            .as('parent')
            .of(TargetElement.at('grandparent selector').as('grandparent'))
        )
        );

        actualElementHandle
      .toString()
      .should.be.equal('child of parent of grandparent');
    });

    it('returns non existing element with isExisting = () => false', async () => {
        const expectedElementHandle: ElementHandle = null;
        (browseTheWeb.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(
            TargetElement.at('selector')
        );

        expect(actualElementHandle).to.not.be.null;
        expect(actualElementHandle).to.not.be.undefined;
        actualElementHandle.isExisting().should.be.false;
    });

    it('uses selector as description by default', async () => {
        const selector = 'real description';
        const expectedElementHandle: ElementHandle = elementHandleStub(sandbox);
        expectedElementHandle.toString = sandbox.stub().returns('fake string');
        (browseTheWeb.$ as SinonStub).resolves(expectedElementHandle);

        const actualElementHandle = await actor.answer(TargetElement.at(selector));

        expect(actualElementHandle.toString()).to.be.equal(`${selector}`);
    });

    it('checks parents for existence', async () => {
        const expectedParent: ElementHandle = null;
        (browseTheWeb.$ as SinonStub).resolves(expectedParent);

        await actor
      .answer(
          TargetElement.at('child selector').of(
              TargetElement.at('parent selector').as('parent')
          )
      )
      .should.be.rejectedWith('Expected parent to be attached');
    });

    // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with constructor even if selected handle == null', async () => {
        (browseTheWeb.$ as SinonStub).resolves(null);

        const element = await actor.answer(
            TargetElement.at('not exsting element selector')
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
    });

    // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with original constructor if selected handle != null', async () => {
        (browseTheWeb.$ as SinonStub).resolves(elementHandleStub(sandbox));

        const element = await actor.answer(
            TargetElement.at('not exsting element selector')
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
        expect(element.constructor.name).to.equal(
            elementHandleStub(sandbox).constructor.name
        );
    });

    describe('delayed until element', () => {
        it('is attached', async () => {
            (page.waitForSelector as SinonStub).resolves(elementHandleStub(sandbox));
            const element = await actor.answer(
                TargetElement.at('selector').whichShouldBecome(isPresent())
            );

            await actor.answer(element);

            page.waitForSelector.should.have.been.called;
            page.waitForSelector.should.have.been.calledWith('selector', {
                state: 'attached',
            });
        });

        it('is visible', async () => {
            (page.waitForSelector as SinonStub).resolves(elementHandleStub(sandbox));
            const element = await actor.answer(
                TargetElement.at('selector').whichShouldBecome(isVisible())
            );

            await actor.answer(element);

            page.waitForSelector.should.have.been.called;
            page.waitForSelector.should.have.been.calledWith('selector', {
                state: 'visible',
            });
        });
    });
});
