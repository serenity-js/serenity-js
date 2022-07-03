import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { By, Hover, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

/** @test {PageElements} */
describe('PageElements', () => {

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating elements', () => {

        describe('by deep css', () => {

            const Elements = {
                cvcLabel:       PageElement.located(By.tagName('label')).describedAs('popup label'),
                infoComponent:  PageElement.located(By.tagName('popup-info')).describedAs('popup info icon'),
                infoTexts:      PageElements.located(By.deepCss('popup-info span.info')).describedAs('popup text'),
            };

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/by_deep_css.html'),
                ));

            it('generates a description for PageElements without a custom description', () => {
                expect(PageElements.located(By.deepCss('ul > li.todo')).toString())
                    .to.equal(`page elements located by deep css ('ul > li.todo')`)
            });

            it('generates a description for PageElements without a custom description, where the selector is provided as question', () => {
                expect(PageElements.located(By.deepCss(question('my selector', 'ul > li.todo'))).toString())
                    .to.equal(`page elements located by deep css (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElements.located(By.deepCss('ul > li.todo')).describedAs('outstanding shopping list item').toString())
                    .to.equal(`outstanding shopping list item`)
            });

            it('can locate elements by deep css', () =>
                actorCalled('Elle').attemptsTo(
                    Hover.over(Elements.infoComponent),
                    Ensure.that(
                        Text.ofAll(PageElements.located(By.deepCss('popup-info span.info'))),
                        equals([ 'Your card validation code (CVC) is an extra security feature — it is the last 3 or 4 numbers on the back of your card.' ])
                    ),
                ));

            it('can locate elements by deep css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Hover.over(Elements.infoComponent),
                    Ensure.that(
                        Text.ofAll(PageElements.located(By.deepCss(question('my selector', 'popup-info span.info')))),
                        equals([ 'Your card validation code (CVC) is an extra security feature — it is the last 3 or 4 numbers on the back of your card.' ])
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.located(By.deepCss('popup-info span.invalid')).count(),
                        equals(0)
                    ),
                ));
        });
    });
});
