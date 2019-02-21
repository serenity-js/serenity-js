import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, CSSClasses, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('CSSClasses', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

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
        it(`allows the actor to read the 'value' attribute of a DOM element matching the locator`, ({ description, expected }) =>
            Bernie.attemptsTo(
                Navigate.to(testPage),

                Ensure.that(
                    CSSClasses.of(Target.the(`Element with ${ description }`).located(by.id(description))),
                    equals(expected),
                ),
            ));
    });
});
