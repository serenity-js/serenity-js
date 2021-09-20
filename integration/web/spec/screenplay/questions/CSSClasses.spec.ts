import 'mocha';

import { contain, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by, CSSClasses, Navigate, Target } from '@serenity-js/web';
import { given } from 'mocha-testdata';

describe('CSSClasses', () => {

    /** @test {CSSClasses} */
    /** @test {CSSClasses.of} */
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
                    CSSClasses.of(Target.the(`Element with ${ description }`).located(by.id(description))),
                    equals(expected),
                ),
            ));

        /** @test {CSSClasses} */
        /** @test {CSSClasses#of} */
        it('allows for a question relative to another target to be asked', () => actorCalled('Bernie').attemptsTo(
            Ensure.that(
                CSSClasses.of(
                    Target.the(`Element with single-class`).located(by.id('single-class')),
                ).of(Target.the(`list`).located(by.tagName('ul'))),
                contain('pretty'),
            ),
        ));
    });
});
