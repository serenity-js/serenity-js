import 'mocha';

import { actorCalled } from '@serenity-js/core';
import { Navigate, PageElement } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { Ensure, isFalse, isTrue } from '@serenity-js/assertions';

/** @test {PageElement} */
describe('PageElement', () => {

    describe('when locating elements', () => {

        describe('by id', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_id.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.locatedById('button-of-interest').toString()).to.equal(`page element located by id ('button-of-interest')`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.locatedById('button-of-interest').describedAs('sign up button').toString()).to.equal(`sign up button`)
            });

            it('can locate an element by id', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedById('button-of-interest').isPresent(), isTrue()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedById('invalid').isPresent(), isFalse()),
                ));
        });
    });
});
