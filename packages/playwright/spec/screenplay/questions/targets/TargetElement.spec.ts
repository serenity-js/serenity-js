import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, ElementHandle, Page } from 'playwright';
import { createSandbox, } from 'sinon';

import { isPresent, isVisible } from '../../../../src/expectations';
import { BrowseTheWeb } from '../../../../src/screenplay/abilities';
import { Close } from '../../../../src/screenplay/interactions';
import { TargetElement } from '../../../../src/screenplay/questions/targets/TargetElement';
import { chai } from '../../../chai-extra';
import {
    elementHandleStub,
} from '../../../stubs/playwright';

const { expect } = chai;

describe('TargetElement Question', () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;

    beforeEach(async () => {
        browseTheWeb = BrowseTheWeb.using(chromium);
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = await (actor.abilityTo(BrowseTheWeb) as any).page();
        page.setContent(`
        <html>
            <input type="text" name="example" id="example" value="random text" />
            <div id="grandparent" name="grandparent">
                <div id="parent" name="parent">
                    <div id="child" name="child">
                    </div>
                </div>
            </div>
        </html>`);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
        actor.attemptsTo(Close.browser());
    });

    it('can be answered with element', async () => {
        const expectedElementHandle: ElementHandle = await page.$('id=example');

        const actualElementHandle = await actor.answer(
            TargetElement.at('id=example')
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(await actualElementHandle.getAttribute('name'))
            .to.be.equal(await expectedElementHandle.getAttribute('name'));
    });

    it('overrides description for the answer', async () => {
        const expectedDescription = 'real description';

        const actualElementHandle = await actor.answer(
            TargetElement.at('selector').as(expectedDescription)
        );

        expect(actualElementHandle.toString()).to.be.equal(
            `${expectedDescription}`
        );
    });

    it('can be a MetaQuestion to return child of a parent', async () => {
        const expectedElementHandle: ElementHandle = await (await page.$('id=parent')).$('id=child');
        const actualElementHandle = await actor.answer(
            TargetElement.at('id=child').of(TargetElement.at('id=parent'))
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(await actualElementHandle.getAttribute('name'))
            .to.be.equal(await expectedElementHandle.getAttribute('name'));
    });

    it('adds information about parent to the description', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.at('id=child').as('child').of(TargetElement.at('id=parent').as('parent'))
        );

        expect(actualElementHandle.toString()).to.be.equal('child of parent');
    });

    it('adds information about all parents in the hierarchy to the description', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.at('id=child')
                .as('child')
                .of(
                    TargetElement.at('id=parent')
                    .as('parent')
                    .of(TargetElement.at('id=grandparent').as('grandparent'))
                )
        );

        expect(actualElementHandle
            .toString())
            .to.be.equal('child of parent of grandparent');
    });

    it('returns non existing element with isExisting = () => false', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.at('non existent selector')
        );

        expect(actualElementHandle).to.not.be.null;
        expect(actualElementHandle).to.not.be.undefined;
        expect(actualElementHandle.isExisting()).to.be.false;
    });

    it('uses selector as description by default', async () => {
        const selector = 'id=example';

        const actualElementHandle = await actor.answer(TargetElement.at(selector));

        expect(actualElementHandle.toString()).to.be.equal(`${selector}`);
    });

    it('checks parents for existence', async () => {
        await expect(actor
            .answer(
                TargetElement.at('child selector').of(
                    TargetElement.at('non existent parent selector').as('parent')
                )
            ))
        .to.be.rejectedWith('Expected parent to be attached');
    });

    // // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with constructor even if selected handle == null', async () => {
        const element = await actor.answer(
            TargetElement.at('not exsting element selector')
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
    });

    // // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with original constructor if selected handle != null', async () => {
        const element = await actor.answer(
            TargetElement.at('id=example')
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
        expect(element.constructor.name).to.equal('ElementHandle');
    });

    describe('delayed until element', () => {
        it('is attached', async () => {
            const waitForSelectorStub = sandbox.stub(page, 'waitForSelector').resolves(elementHandleStub(sandbox) as ElementHandle<HTMLElement>);
            const element = await actor.answer(
                TargetElement.at('selector').whichShouldBecome(isPresent())
            );

            await actor.answer(element);

            expect(waitForSelectorStub).to.have.been.called;
            expect(waitForSelectorStub).to.have.been.calledWith('selector', {
                state: 'attached',
            });
        });

        it('is visible', async () => {
            const waitForSelectorStub = sandbox.stub(page, 'waitForSelector').resolves(elementHandleStub(sandbox) as ElementHandle<HTMLElement>);
            const element = await actor.answer(
                TargetElement.at('selector').whichShouldBecome(isVisible())
            );

            await actor.answer(element);

            expect(waitForSelectorStub).to.have.been.called;
            expect(waitForSelectorStub).to.have.been.calledWith('selector', {
                state: 'visible',
            });
        });
    });
});
