import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, CssClasses, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';
import { given } from 'mocha-testdata';

/** @test {CssClasses} */
describe('CssClasses', () => {

    /** @test {CssClasses.of} */
    describe('of', () => {

        before(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/css-classes/example.html'),
            ));

        given([
            { description: 'no-class-attribute',                    expected: []                            },
            { description: 'no-class-attribute',                    expected: []                            },
            { description: 'class-attribute-with-whitespace-only',  expected: []                            },
            { description: 'single-class',                          expected: ['pretty']                    },
            { description: 'several-classes',                       expected: ['pretty', 'css', 'classes']  },
            { description: 'several-classes-with-whitespace',       expected: ['pretty', 'css', 'classes']  },
        ]).
        it('allows the actor to read the css classes of a DOM element matching the locator', ({ description, expected }) =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(
                    CssClasses.of(PageElement.located(By.id(description)).describedAs(`Element with ${ description }`)),
                    equals(expected),
                ),
            ));

        it('produces a QuestionAdapter that enables access to the underlying value', () =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(
                    CssClasses.of(PageElement.located(By.id('several-classes'))).length,
                    equals(3),
                ),
                Ensure.that(
                    CssClasses.of(PageElement.located(By.id('several-classes')))[0],
                    equals('pretty'),
                ),
                Ensure.that(
                    CssClasses.of(PageElement.located(By.id('several-classes')))[0].length,
                    equals(6),
                ),
            ));

        it('allows for a meta-question relative to another PageElement to be asked', () =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(
                    CssClasses.of(
                        PageElement.located(By.id('single-class')).describedAs(`Element with single-class`),
                    ).of(PageElement.located(By.tagName('ul')).describedAs(`list`)),
                    contain('pretty'),
                ),
            ));
    });

    /** @test {CssClasses.of} */
    describe('filtering', () => {

        const listItems = PageElements.located(By.css('li')).describedAs('list items');

        before(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/css-classes/filtering.html'),
            ));

        it('keep only those elements which CSS classes match the expectation', () =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(
                    Text.ofAll(listItems.where(CssClasses, contain('keep'))),

                    equals([
                        'first (keep)',
                        'third (keep)',
                        'fourth (keep, skip)',
                    ]),
                ),
            ));

        it('keep only those elements which CSS classes match all the expectations', () =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(
                    Text.ofAll(
                        listItems
                            .where(CssClasses, contain('keep'))
                            .where(CssClasses, not(contain('skip')))
                    ),

                    equals([
                        'first (keep)',
                        'third (keep)',
                    ]),
                ),
            ));
    });

    /** @test {CssClasses#toString} */
    describe('toString', () => {

        const sections  = PageElements.located(By.css('section')).describedAs('sections');
        const section   = PageElement.located(By.css('section')).describedAs('a section');
        const heading   = PageElement.located(By.css('h1')).describedAs('the heading');

        it('provides a human-readable description of a regular question', () => {
            const description = CssClasses.of(heading).toString();

            expect(description).to.equal('CSS classes of the heading')
        });

        it('allows for the description to be altered', () => {
            const description = CssClasses.of(heading).describedAs('style').toString();

            expect(description).to.equal('style')
        });

        it('provides a human-readable description of the meta-question', () => {
            const description = CssClasses.of(heading).of(section).toString();

            expect(description).to.equal('CSS classes of the heading of a section')
        });

        it('provides a human-readable description of a reqular question used in a filter', () => {
            const found = sections.where(CssClasses, equals(['important']));

            const description = found.toString();

            expect(description).to.equal(`sections where CssClasses does equal [ 'important' ]`)
        });

        it('provides a human-readable description of a meta-question used in a filter', () => {
            const found = sections
                .where(CssClasses.of(heading), equals([ 'important' ]));

            const description = found.toString();

            expect(description).to.equal(`sections where CSS classes of the heading does equal [ 'important' ]`)
        });
    });
});
