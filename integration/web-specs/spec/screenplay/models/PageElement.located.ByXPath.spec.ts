import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { By, Navigate, PageElement } from '@serenity-js/web';

/** @test {PageElement} */
describe('PageElement', () => {

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating an element', () => {

        describe('by XPath', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_css.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.xpath('//ul/li[contains(text(), "Coffee")]')).toString())
                    .to.equal(`page element located by xpath ('//ul/li[contains(text(), "Coffee")]')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector and/or text are provided as questions', () => {
                expect(
                    PageElement.located(By.xpath(question('my selector', '//ul/li[contains(text(), "Coffee")]'))).toString()
                ).to.equal(`page element located by xpath (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.xpath('//ul/li[contains(text(), "Coffee")]')).describedAs('a shopping list item').toString())
                    .to.equal(`a shopping list item`)
            });

            it('can locate an element by xpath', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.xpath('//ul/li[contains(text(), "Coffee")]')), isPresent()),
                ));

            it('can locate an element by xpath, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElement.located(By.xpath(question('my selector', '//ul/li[contains(text(), "Coffee")]'))),
                        isPresent()
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.xpath('//input')), not(isPresent())),
                ));
        });
    });
});
