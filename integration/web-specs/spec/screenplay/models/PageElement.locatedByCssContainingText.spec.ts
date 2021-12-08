import 'mocha';

import { Ensure, isFalse, isTrue } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { Navigate, PageElement } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';

/** @test {PageElement} */
describe('PageElement', () => {

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating an element', () => {

        describe('by css containing text', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_css.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.locatedByCssContainingText('li.todo', 'Coffee').toString())
                    .to.equal(`page element located by css ('li.todo') containing text 'Coffee'`)
            });

            it('generates a description for a PageElement without a custom description, where the selector and/or text are provided as questions', () => {
                expect(
                    PageElement.locatedByCssContainingText(
                        question('my selector', 'li.todo'),
                        question('desired text', 'Coffee'),
                    ).toString()
                ).to.equal(`page element located by css (<<my selector>>) containing text <<desired text>>`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.locatedByCssContainingText('ul > li.todo', 'coffee').describedAs('a shopping list item').toString())
                    .to.equal(`a shopping list item`)
            });

            it('can locate an element by css containing text', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedByCssContainingText('li.todo', 'Coffee').isPresent(), isTrue()),
                ));

            it.only('can locate an element by css containing text, where the selector or text are provided as questions', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElement.locatedByCssContainingText(
                            question('my selector', 'li.todo'),
                            question('desired text', 'Coffee'),
                        ).isPresent(),
                        isTrue()
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedByCssContainingText('li.todo', 'blueberries').isPresent(), isFalse()),
                ));
        });

    });
});
