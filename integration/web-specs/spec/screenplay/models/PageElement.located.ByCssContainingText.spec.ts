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

        describe('by css containing text', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_css.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.cssContainingText('li.todo', 'Coffee')).toString())
                    .to.equal(`page element located by css ('li.todo') containing text 'Coffee'`)
            });

            it('generates a description for a PageElement without a custom description, where the selector and/or text are provided as questions', () => {
                expect(
                    PageElement.located(By.cssContainingText(
                        question('my selector', 'li.todo'),
                        question('desired text', 'Coffee'),
                    )).toString()
                ).to.equal(`page element located by css (<<my selector>>) containing text <<desired text>>`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.cssContainingText('ul > li.todo', 'coffee')).describedAs('a shopping list item').toString())
                    .to.equal(`a shopping list item`)
            });

            it('can locate an element by css containing text', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.cssContainingText('li.todo', 'Coffee')), isPresent()),
                ));

            it('can locate an element by css containing text, where the selector or text are provided as questions', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElement.located(By.cssContainingText(
                            question('my selector', 'li.todo'),
                            question('desired text', 'Coffee'),
                        )),
                        isPresent()
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.cssContainingText('li.todo', 'blueberries')), not(isPresent())),
                ));
        });
    });
});
