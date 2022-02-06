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

        describe('by id', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_id.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.id('button-of-interest')).toString())
                    .to.equal(`page element located by id ('button-of-interest')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.located(By.id(question('my selector', 'button-of-interest'))).toString())
                    .to.equal(`page element located by id (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.id('button-of-interest')).describedAs('sign up button').toString())
                    .to.equal(`sign up button`)
            });

            it('can locate an element by id', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.id('button-of-interest')), isPresent()),
                ));

            it('can locate an element by id, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.id(question('my selector', 'button-of-interest'))), isPresent()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.located(By.id('invalid')), not(isPresent())),
                ));
        });
    });
});
