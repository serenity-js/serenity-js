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

        describe('by css', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_css.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.css('ul > li.todo:first-child')).toString())
                    .to.equal(`page element located by css ('ul > li.todo:first-child')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.located(By.css(question('my selector', 'ul > li.todo:first-child'))).toString())
                    .to.equal(`page element located by css (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.css('ul > li.todo:first-child')).describedAs('first shopping list item').toString())
                    .to.equal(`first shopping list item`)
            });

            it('can locate an element by css', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.css('ul > li.todo:first-child')), isPresent()),
                ));

            it('can locate an element by css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.css(question('my selector', 'ul > li.todo:first-child'))), isPresent()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.css('ul > li.invalid')), not(isPresent())),
                ));
        });
    });
});
