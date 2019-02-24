import { expect } from '@integration/testing-tools';
import { contains, Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';
import { BrowseTheWeb, Navigate, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @target {Target} */
describe('Target', () => {

    const shoppingListPage = pageFromTemplate(`
        <html>
            <body>
                <div id="shopping-list-app">
                    <h1>Shopping <span>list</span></h1>
                    <h2 class="progress"><span>2</span> out of 3</h2>
                    <ul>
                        <li class="buy">oats</li>
                        <li class="buy">coconut milk</li>
                        <li class="bought">coffee</li>
                    </ul>
                </div>
            </body>
        </html>
    `);

    class ShoppingList {
        static App                  = Target.the('shopping list app').located(by.id('shopping-list-app'));
        static Progress             = Target.the('progress bar').in(ShoppingList.App).located(by.css('.progress'));
        static Number_Of_Items_Left = Target.the('number of items left').in(ShoppingList.Progress).located(by.css('span'));

        static Header       = Target.the('header').located(by.tagName('h1'));
        static List         = Target.the('shopping list').located(by.tagName('ul'));
        static Items        = Target.all('items').in(ShoppingList.App).located(by.tagName('li'));
        static Bought_Items = Target.all('bought items').in(ShoppingList.List).located(by.css('.bought'));
    }

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    describe('allows the actor to locate', () => {

        it('a single web element matching the selector', () => Bernie.attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.of(ShoppingList.Header), equals('Shopping list')),
        ));

        it('all web elements matching the selector', () => Bernie.attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.ofAll(ShoppingList.Items), contains('oats')),
        ));

        it('an element relative to another target', () => Bernie.attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.of(ShoppingList.Number_Of_Items_Left), equals('2')),
        ));

        it('all elements relative to another target', () => Bernie.attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.ofAll(ShoppingList.Bought_Items), equals(['coffee'])),
        ));
    });

    describe('provides a sensible description of', () => {

        describe('an element that', () => {

            it('is being targeted', () => {
                expect(ShoppingList.Header.toString())
                    .to.equal('the header');
            });

            it('has been located', () => {
                expect(ShoppingList.Header.answeredBy(Bernie).toString())
                    .to.equal('the header');
            });

            it('is nested', () =>
                expect(ShoppingList.Number_Of_Items_Left.answeredBy(Bernie).toString())
                    .to.equal('the number of items left in the progress bar in the shopping list app'));
        });

        describe('elements that', () => {

            it('are being targeted', () => {
                expect(ShoppingList.Items.toString())
                    .to.equal('all the items in the shopping list app');
            });

            it('have been located', () =>
                expect(ShoppingList.Items.answeredBy(Bernie).toString())
                    .to.equal('all the items in the shopping list app'));

            it('are nested', () =>
                expect(ShoppingList.Bought_Items.answeredBy(Bernie).toString())
                    .to.equal('all the bought items in the shopping list'));
        });
    });
});
