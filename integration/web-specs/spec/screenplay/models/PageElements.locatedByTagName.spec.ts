import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { Navigate, PageElements } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';

/** @test {PageElements} */
describe('PageElements', () => {

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating elements', () => {

        describe('by tag name', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/by_tag_name.html'),
                ));

            it('generates a description for PageElements without a custom description', () => {
                expect(PageElements.locatedByTagName('li').toString())
                    .to.equal(`page elements located by tag name ('li')`)
            });

            it('generates a description for PageElements without a custom description, where the selector is provided as question', () => {
                expect(PageElements.locatedByTagName(question('my selector', 'li')).toString())
                    .to.equal(`page elements located by tag name (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElements.locatedByTagName('li').describedAs('list items').toString())
                    .to.equal(`list items`)
            });

            it('can locate elements by tag name', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElements.locatedByTagName('li').count(), equals(3)),
                ));

            it('can locate elements by tag name, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElements.locatedByTagName(question('my selector', 'li')).count(), equals(3)),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElements.locatedByTagName('ol').count(), equals(0)),
                ));
        });
    });
});
