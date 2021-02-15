import 'mocha';

import { contain, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by } from 'protractor';

import { CSSClasses, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('CSSClasses', () => {

    const testPage = pageFromTemplate(`
            <html>
            <body>
                <ul>
                    <li id="no-class-attribute"></li>
                    <li id="empty-class-attribute" class=""></li>
                    <li id="class-attribute-with-whitespace-only" class="   "></li>
                    <li id="single-class" class="pretty"></li>
                    <li id="several-classes" class="pretty css classes"></li>
                    <li id="several-classes-with-whitespace" class="  pretty   css  classes     "></li>
                </ul>
            </body>
            </html>
        `);

    beforeEach(() => engage(new UIActors()));

    /** @test {CSSClasses} */
    /** @test {CSSClasses.of} */
    describe('of', () => {

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
                Navigate.to(testPage),

                Ensure.that(
                    CSSClasses.of(Target.the(`Element with ${ description }`).located(by.id(description))),
                    equals(expected),
                ),
            ));

        /** @test {CSSClasses} */
        /** @test {CSSClasses#of} */
        it('allows for a question relative to another target to be asked', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(testPage),

            Ensure.that(
                CSSClasses.of(
                    Target.the(`Element with single-class`).located(by.id('single-class')),
                ).of(Target.the(`list`).located(by.tagName('ul'))),
                contain('pretty'),
            ),
        ));
    });
});
