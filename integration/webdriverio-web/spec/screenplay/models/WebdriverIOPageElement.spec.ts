import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { ByCss, Click, isSelected, Navigate, PageElement } from '@serenity-js/web';
import { $ } from '@wdio/globals';

/** @test {WebdriverIOPageElement} */
describe('WebdriverIOPageElement', () => {

    describe('when wrapping native elements', () => {

        beforeEach(() =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/checkbox.html'),
            ),
        );

        it('preserves information about the original selector', async() => {
            const nativeElement = await $('#checkbox');

            const pageElement = PageElement.from(nativeElement);
            const selector = await actorCalled('Natalie').answer(pageElement.locator.selector);

            expect(selector).to.be.instanceOf(ByCss);
            expect((selector as ByCss).value).to.equal('#checkbox');
        })

        it(`lets the actor interact with the element`, async () => {
            const nativeElement = await $('#checkbox');

            const pageElement = PageElement.from(nativeElement);

            await actorCalled('Natalie').attemptsTo(
                Ensure.that(pageElement, not(isSelected())),
                Click.on(pageElement),
                Ensure.that(pageElement, isSelected()),
            )
        });
    });
});

