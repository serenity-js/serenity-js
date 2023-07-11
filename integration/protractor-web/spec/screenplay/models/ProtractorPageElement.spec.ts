import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import {
    ByCss,
    ByCssContainingText,
    ByDeepCss,
    ById,
    ByXPath,
    Click,
    isSelected,
    Navigate,
    PageElement
} from '@serenity-js/web';
import { given } from 'mocha-testdata';
import { $, by, protractor } from 'protractor';

/** @test {ProtractorPageElement} */
describe('ProtractorPageElement', () => {

    describe('when wrapping native elements', () => {

        beforeEach(() =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/checkbox.html'),
            ),
        );

        given([
            { description: 'css',                       locator: by.css(`#checkbox`),                           expected: new ByCss('#checkbox') },
            { description: 'css containing text',       locator: by.cssContainingText('input', 'submit'),       expected: new ByCssContainingText('input', 'submit') },
            { description: 'css with text and quotes',  locator: by.cssContainingText('input', 'say "hello"'),  expected: new ByCssContainingText('input', 'say "hello"') },
            { description: 'deep css',                  locator: by.shadowDomCss('#checkbox'),                  expected: new ByDeepCss('#checkbox') },
            { description: 'id',                        locator: by.id('checkbox'),                             expected: new ById('checkbox') },
            { description: 'tag name',                  locator: by.tagName('input'),                           expected: new ByCss('input') },
            { description: 'xpath',                     locator: by.xpath('//input'),                           expected: new ByXPath('//input') },
        ]).
        it('preserves information about the original selector', async ({ locator, expected }) => {
            const nativeElement = await protractor.element(locator);

            const pageElement = PageElement.from(nativeElement);
            const selector = await actorCalled('Natalie').answer(pageElement.locator.selector);

            expect(selector).to.equal(expected);
        });

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

