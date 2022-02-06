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

        describe('by tag name', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_tag_name.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.tagName('button')).toString())
                    .to.equal(`page element located by tag name ('button')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.located(By.tagName(question('my selector', 'button'))).toString())
                    .to.equal(`page element located by tag name (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.tagName('button')).describedAs('button').toString())
                    .to.equal(`button`)
            });

            it('can locate an element by css', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.tagName('button')), isPresent()),
                ));

            it('can locate an element by css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.tagName(question('my selector', 'button'))), isPresent()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.tagName('input')), not(isPresent())),
                ));
        });
    });
});
