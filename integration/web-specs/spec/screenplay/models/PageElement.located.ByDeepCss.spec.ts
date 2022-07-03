import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { By, Hover, Navigate, PageElement } from '@serenity-js/web';

/** @test {PageElement} */
describe('PageElement', () => {

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating an element', () => {

        describe('by deep css', () => {

            const Elements = {
                cvcLabel:       PageElement.located(By.tagName('label')).describedAs('popup label'),
                infoComponent:  PageElement.located(By.tagName('popup-info')).describedAs('popup info icon'),
                infoText:       PageElement.located(By.deepCss('popup-info span.info')).describedAs('popup text'),
            };

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_deep_css.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.deepCss('ul > li.todo:first-child')).toString())
                    .to.equal(`page element located by deep css ('ul > li.todo:first-child')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.located(By.deepCss(question('my selector', 'ul > li.todo:first-child'))).toString())
                    .to.equal(`page element located by deep css (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.deepCss('ul > li.todo:first-child')).describedAs('first shopping list item').toString())
                    .to.equal(`first shopping list item`)
            });

            it('can locate an element by shadow DOM-piercing CSS selector', () =>
                actorCalled('Elle').attemptsTo(
                    Hover.over(Elements.infoComponent),
                    Ensure.that(Elements.infoText, isPresent()),
                ));

            it('can locate an element by shadow DOM-piercing CSS selector, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Hover.over(Elements.infoComponent),
                    Ensure.that(PageElement.located(By.deepCss(question('my selector', 'popup-info span.info'))), isPresent()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Hover.over(Elements.infoComponent),
                    Ensure.that(PageElement.located(By.deepCss('popup-info span.invalid')), not(isPresent())),
                ));
        });
    });
});
