import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Text', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    describe('of', () => {

        const Header = Target.the('header').located(by.tagName('h1'));

        /** @test {Text} */
        /** @test {Text.of} */
        it('allows the actor to read the text of the DOM element matching the locator', () => Bernie.attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                <body>
                    <h1>Hello World!</h1>
                </body>
                </html>
            `)),

            Ensure.that(Text.of(Header), equals('Hello World!')),
        ));

        it(`produces a sensible description of the question being asked`, () => {
            expect(Text.of(Target.the('header').located(by.tagName('h1'))).toString())
                .to.equal('the text of the header');
        });
    });

    describe('ofAll', () => {

        const Shopping_List_Items = Target.all('shopping list items').located(by.css('li'));

        /** @test {Text} */
        /** @test {Text.ofAll} */
        it('allows the actor to read the text of all DOM elements matching the locator', () => Bernie.attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                <body>
                    <h1>Shopping list</h1>
                    <ul>
                        <li>milk</li>
                        <li>oats</li>
                    </ul>
                </body>
                </html>
            `)),

            Ensure.that(Text.ofAll(Shopping_List_Items), equals(['milk', 'oats'])),
        ));

        it(`produces sensible description of the question being asked`, () => {
            expect(Text.ofAll(Shopping_List_Items).toString())
                .to.equal('the text of the shopping list items');
        });
    });
});
