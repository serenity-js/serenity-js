import "mocha";

import { expect } from '@integration/testing-tools';
import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, ElementHandle, Page } from 'playwright';
import { createSandbox, } from 'sinon';

import { by } from '../../../../src/screenplay';
import { BrowseTheWeb } from '../../../../src/screenplay/abilities';
import { Close } from '../../../../src/screenplay/interactions';
import { TargetElement } from '../../../../src/screenplay/questions/targets/TargetElement';

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
            TargetElement.located(by.id('example'))
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(await actualElementHandle.getAttribute('name'))
            .to.be.equal(await expectedElementHandle.getAttribute('name'));
    });

    it('overrides description for the answer', async () => {
        const expectedDescription = 'real description';

        const actualElementHandle = await actor.answer(
            TargetElement.located(by.css('selector')).as(expectedDescription)
        );

        expect(actualElementHandle.toString()).to.be.equal(
            `${expectedDescription}`
        );
    });

    it('can be a MetaQuestion to return child of a parent', async () => {
        const expectedElementHandle: ElementHandle = await (await page.$('id=parent')).$('id=child');
        const actualElementHandle = await actor.answer(
            TargetElement.located(by.id('child')).of(TargetElement.located(by.id('parent')))
        );

        expect(actualElementHandle.isExisting()).to.be.true;
        expect(await actualElementHandle.getAttribute('name'))
            .to.be.equal(await expectedElementHandle.getAttribute('name'));
    });

    it('adds information about parent to the description', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.located(by.id('child')).as('child').of(TargetElement.located(by.id('parent')).as('parent'))
        );

        expect(actualElementHandle.toString()).to.be.equal('child of parent');
    });

    it('adds information about all parents in the hierarchy to the description', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.located(by.id('child'))
                .as('child')
                .of(
                    TargetElement.located(by.id('parent'))
                    .as('parent')
                    .of(TargetElement.located(by.id('grandparent')).as('grandparent'))
                )
        );

        expect(actualElementHandle
            .toString())
            .to.be.equal('child of parent of grandparent');
    });

    it('returns non existing element with isExisting = () => false', async () => {
        const actualElementHandle = await actor.answer(
            TargetElement.located(by.css('non existent selector'))
        );

        expect(actualElementHandle).to.not.be.null;
        expect(actualElementHandle).to.not.be.undefined;
        expect(actualElementHandle.isExisting()).to.be.false;
    });

    it('uses selector as description by default', async () => {
        const selector = 'id=example';

        const actualElementHandle = await actor.answer(TargetElement.located(by.css(selector)));

        expect(actualElementHandle.toString()).to.be.equal(by.css(selector).toString());
    });

    it('checks parents for existence', async () => {
        await expect(actor
            .answer(
                TargetElement.located(by.css('child selector')).of(
                    TargetElement.located(by.css('non existent parent selector')).as('parent')
                )
            ))
        .to.be.rejectedWith('Expected parent to be attached');
    });

    // // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with constructor even if selected handle == null', async () => {
        const element = await actor.answer(
            TargetElement.located(by.css('not exsting element selector'))
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
    });

    // // I don't remember what's this for, but its needed... Failures were in the samples
    it('responds with answer with original constructor if selected handle != null', async () => {
        const element = await actor.answer(
            TargetElement.located(by.id('example'))
        );
        expect(element.constructor, 'Constructor does not exist').to.exist;
        expect(element.constructor.name).to.equal('ElementHandle');
    });
});
