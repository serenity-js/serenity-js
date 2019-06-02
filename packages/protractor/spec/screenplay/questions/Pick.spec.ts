import { expect, stage } from '@integration/testing-tools';
import { contain, Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Question } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by, ElementArrayFinder, ElementFinder } from 'protractor';
import { Click, CSSClasses, Navigate, Pick, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Pick', () => {

    const Peter = stage(new UIActors()).actor('Peter');

    const shoppingListPage = pageFromTemplate(`
        <html>
        <body>
        <div id="shopping-list-app">
            <h1>Shopping list</h1>
            <ul>
                <li class="buy 1st">
                    <span class="item-name">oats</span>
                    <a onclick="toggle(this)">x</a>
                </li>
                <li class="buy 2nd">
                    <span class="item-name">coconut milk</span>
                    <a onclick="toggle(this)">x</a>
                </li>
                <li class="3rd">
                    <span class="item-name">coffee</span>
                    <a onclick="toggle(this)">x</a>
                </li>
            </ul>
        </div>
        <script>
            function toggle(event) {
                event.parentNode.classList.toggle('buy');
            }
        </script>
        </body>
        </html>
    `);

    class ShoppingList {
        static Items        = Target.all('shopping list items').located(by.css('li'));
        static Item         = Target.the('shopping list item').located(by.css('li'));
        static Titles       = Target.all('shopping list item titles').located(by.css('li span.item-name'));
        static Item_Name    = Target.the('item name').located(by.tagName('span.item-name'));
        static Item_Names   = Target.all('item names').located(by.tagName('span.item-name'));
    }

    describe('(when no filters are applied)', () => {

        describe('lets the actor interact with the list of matching elements so that it', () => {

            const picked = Pick.from<ElementFinder, ElementArrayFinder>(ShoppingList.Titles);

            it('gets the number of items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(picked.count(), equals(3)),
            ));

            it('picks all the items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.ofAll(picked.all()), contain('coconut milk')),
            ));

            it('picks the first item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.first()), equals('oats')),
            ));

            it('picks the last item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.last()), equals('coffee')),
            ));

            it('picks the nth item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.get(1)), equals('coconut milk')),
            ));

        });

        describe('provides a sensible description when it', () => {

            const picked = Pick.from(ShoppingList.Items);

            it('returns the number of items', () =>
                expect(picked.count().toString())
                    .to.equal('the number of the shopping list items'));

            it('picks all the items', () =>
                expect(picked.all().toString())
                    .to.equal('the shopping list items'));

            it('picks the first item', () =>
                expect(picked.first().toString())
                    .to.equal('the first of the shopping list items'));

            it('picks the last item', () =>
                expect(picked.last().toString())
                    .to.equal('the last of the shopping list items'));

            given([
                { description: '1st',    index: 0 },
                { description: '2nd',    index: 1 },
                { description: '3rd',    index: 2 },
                { description: '4th',    index: 3 },
                { description: '5th',    index: 4 },
                { description: '10th',   index: 9 },
                { description: '11th',   index: 10 },
                { description: '20th',   index: 19 },
                { description: '42nd',   index: 41 },
                { description: '115th',  index: 114 },
                { description: '1522nd', index: 1521 },

            ]).
            it('picks the nth item', ({ description, index }) => {
                expect(picked.get(index).toString())
                    .to.equal(`the ${ description } of the shopping list items`);
            });
        });
    });

    describe('(when a filter is applied)', () => {

        const picked = Pick.from<ElementFinder, ElementArrayFinder>(ShoppingList.Items).where(CSSClasses, contain('buy'));

        describe('lets the actor filter the list of matching elements so that it', () => {

            it('gets the number of items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(picked.count(), equals(2)),
            ));

            it('picks all the items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.ofAll(picked.all()), contain('coconut milk x')),
            ));

            it('picks the first item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.first()), startsWith('oats')),
            ));

            it('picks the last item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.last()), startsWith('coconut milk')),
            ));

            it('picks the nth item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.get(1)), startsWith('coconut milk')),
            ));
        });

        describe('provides a sensible description when it', () => {

            it('returns the number of answers', () =>
                expect(picked.count().toString())
                    .to.equal(`the number of the shopping list items where CSSClasses property does contain 'buy'`));

            it('picks all the items', () =>
                expect(picked.all().toString())
                    .to.equal(`the shopping list items where CSSClasses property does contain 'buy'`));

            it('picks the first item', () =>
                expect(picked.first().toString())
                    .to.equal(`the first of the shopping list items where CSSClasses property does contain 'buy'`));

            it('picks the last item', () =>
                expect(picked.last().toString())
                    .to.equal(`the last of the shopping list items where CSSClasses property does contain 'buy'`));

            given([
                { description: '1st',    index: 0 },
                { description: '2nd',    index: 1 },
                { description: '3rd',    index: 2 },
                { description: '4th',    index: 3 },
                { description: '5th',    index: 4 },
                { description: '10th',   index: 9 },
                { description: '11th',   index: 10 },
                { description: '20th',   index: 19 },
                { description: '42nd',   index: 41 },
                { description: '115th',  index: 114 },
                { description: '1522nd', index: 1521 },
            ]).
            it('picks the nth item', ({ description, index }) => {
                expect(picked.get(index).toString()).to.equal(`the ${ description } of the shopping list items where CSSClasses property does contain 'buy'`);
            });
        });
    });

    describe('(when multiple filters are applied)', () => {

        const picked = Pick.from<ElementFinder, ElementArrayFinder>(ShoppingList.Items).where(CSSClasses, contain('buy')).where(Text, startsWith('coconut'));

        describe('lets the actor filter the list of matching elements so that it', () => {

            it('gets the number of items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(picked.count(), equals(1)),
            ));

            it('picks all the items', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.ofAll(picked.all()), contain('coconut milk x')),
            ));

            it('picks the first item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.first()), startsWith('coconut milk')),
            ));

            it('picks the last item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.last()), startsWith('coconut milk')),
            ));

            it('picks the nth item', () => Peter.attemptsTo(
                Navigate.to(shoppingListPage),

                Ensure.that(Text.of(picked.get(0)), startsWith('coconut milk')),
            ));
        });

        describe('provides a sensible description when it', () => {

            it('returns the number of answers', () =>
                expect(picked.count().toString())
                    .to.equal(`the number of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

            it('picks all the items', () =>
                expect(picked.all().toString())
                    .to.equal(`the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

            it('picks the first item', () =>
                expect(picked.first().toString())
                    .to.equal(`the first of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

            it('picks the last item', () =>
                expect(picked.last().toString())
                    .to.equal(`the last of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

            given([
                { description: '1st',    index: 0 },
                { description: '2nd',    index: 1 },
                { description: '3rd',    index: 2 },
                { description: '4th',    index: 3 },
                { description: '5th',    index: 4 },
                { description: '10th',   index: 9 },
                { description: '11th',   index: 10 },
                { description: '20th',   index: 19 },
                { description: '42nd',   index: 41 },
                { description: '115th',  index: 114 },
                { description: '1522nd', index: 1521 },
            ]).
            it('picks the nth item', ({ description, index }) => {
                expect(picked.get(index).toString())
                    .to.equal(`the ${ description } of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`);
            });
        });
    });

    describe('(when interacting with elements on screen)', () => {

        const ItemCalled = (name: string) =>
            Pick.from<ElementFinder, ElementArrayFinder>(ShoppingList.Items)
                .where(Text.of(ShoppingList.Item_Name), equals(name)).first();

        const ItemsLeftToBuy = () =>
            Pick.from<ElementFinder, ElementArrayFinder>(ShoppingList.Items)
                .where(CSSClasses, contain('buy'))
                .all();

        const LinkTo = (item: Question<ElementFinder> | ElementFinder) => Target.the('link to element').of(item).located(by.css('a'));

        it('makes it easy for an actor to pick the element of interest', () => Peter.attemptsTo(
            Navigate.to(shoppingListPage),

            Click.on(LinkTo(ItemCalled('coffee'))),

            Ensure.that(CSSClasses.of(ItemCalled('coffee')), contain('buy')),
        ));

        it('makes it easy for an actor to pick all elements of interest', () => Peter.attemptsTo(
            Navigate.to(shoppingListPage),

            Click.on(LinkTo(ItemCalled('coconut milk'))),
            Click.on(LinkTo(ItemCalled('coffee'))),

            Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coffee x' ])),
        ));
    });
});
