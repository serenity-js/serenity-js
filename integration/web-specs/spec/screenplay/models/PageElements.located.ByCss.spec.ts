import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { By, Navigate, PageElements, Text } from '@serenity-js/web';

/** @test {PageElements} */
describe('PageElements', () => {

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating elements', () => {

        describe('by css', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/by_css.html'),
                ));

            it('generates a description for PageElements without a custom description', () => {
                expect(PageElements.located(By.css('ul > li.todo')).toString())
                    .to.equal(`page elements located by css ('ul > li.todo')`)
            });

            it('generates a description for PageElements without a custom description, where the selector is provided as question', () => {
                expect(PageElements.located(By.css(question('my selector', 'ul > li.todo'))).toString())
                    .to.equal(`page elements located by css (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElements.located(By.css('ul > li.todo')).describedAs('outstanding shopping list item').toString())
                    .to.equal(`outstanding shopping list item`)
            });

            it('can locate elements by css', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.located(By.css('ul > li.todo')).eachMappedTo(Text),
                        equals(['Coconut milk', 'Coffee'])
                    ),
                ));

            it('can locate elements by css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.located(By.css(question('my selector', 'ul > li.todo'))).count(),
                        equals(2)
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.located(By.css('ul > li.invalid')).count(),
                        equals(0)
                    ),
                ));
        });
    });
});
