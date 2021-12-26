import 'mocha';

import { contain, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, CssClasses, Navigate, PageElement } from '@serenity-js/web';
import { given } from 'mocha-testdata';

describe('CssClasses', () => {

    /** @test {CssClasses} */
    /** @test {CssClasses.of} */
    describe('of', () => {

        before(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/questions/css-classes/example.html'),
            )
        );

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

        /** @test {CssClasses} */
        /** @test {CssClasses#of} */
        it('allows for a question relative to another target to be asked', () => actorCalled('Bernie').attemptsTo(
            Ensure.that(
                CssClasses.of(
                    PageElement.located(By.id('single-class')).describedAs(`Element with single-class`),
                ).of(PageElement.located(By.tagName('ul')).describedAs(`list`)),
                contain('pretty'),
            ),
        ));
    });
});
