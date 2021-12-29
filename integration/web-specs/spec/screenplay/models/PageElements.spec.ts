import 'mocha';

import { contain, Ensure, equals, startsWith } from '@serenity-js/assertions';
import { actorCalled, Answerable } from '@serenity-js/core';
import { By, Click, CssClasses, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { given } from 'mocha-testdata';

class ShoppingList {
    static app = () =>
        PageElement.located(By.id('shopping-list-app'))
            .describedAs('shopping list app');

    static progress = () =>
        PageElement.located(By.css('.progress'))
            .describedAs('progress bar')
            .of(ShoppingList.app());

    static numberOfItemsLeft = () =>
        PageElement.located(By.css('span'))
            .describedAs('number of items left')
            .of(ShoppingList.progress());

    static header = () =>
        PageElement.located(By.tagName('h1')).describedAs('header');

    static list = () =>
        PageElement.located(By.tagName('ul')).describedAs('shopping list');

    static items = () =>
        PageElements.located(By.tagName('li'))
            .describedAs('items')
            .of(ShoppingList.app());

    static boughtItems = () =>
        PageElements.located(By.css('.bought'))
            .describedAs('bought items')
            .of(ShoppingList.list());
}

class AdvancedShoppingList {
    static items = () =>
        PageElements.located(By.css('li')).describedAs('shopping list items');

    static item = () =>
        PageElement.located(By.css('li')).describedAs('shopping list item');

    static titles = () =>
        PageElements.located(By.css('li span.item-name')).describedAs('shopping list item titles');

    static itemName = () =>
        PageElement.located(By.css('span.item-name')).describedAs('item name');
}

const ItemCalled = (name: string) =>
    AdvancedShoppingList.items()
        .where(Text.of(AdvancedShoppingList.itemName()), equals(name))
        .first();

const ItemsLeftToBuy = () =>
    AdvancedShoppingList.items()
        .where(CssClasses, contain('buy'));

const LinkTo = (item: Answerable<PageElement>) =>
    PageElement.located(By.css('a')).of(item).describedAs('link to element');

/** @test {PageElements} */
describe('PageElements', () => {

    describe('allows the actor to locate', () => {

        it('a single web element matching the selector', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/shopping_list.html'),

                Ensure.that(Text.of(ShoppingList.header()), equals('Shopping list')),
            ));

        it('all web elements matching a selector', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.items()), contain('oats')),
            ));

        it('an element relative to another page element', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/shopping_list.html'),
                Ensure.that(ShoppingList.numberOfItemsLeft().text().as(Number), equals(2)),
            ));

        it('all elements relative to another page element', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/questions/page-elements/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.boughtItems()), equals([ 'coffee' ])),
            ));
    });

    describe('provides a sensible auto-generated description of', () => {

        describe('an element that', () => {

            it('is being located', () => {
                expect(ShoppingList.header().toString())
                    .to.equal('header');
            });

            it('is nested', () => {
                expect(ShoppingList.numberOfItemsLeft().toString())
                    .to.equal('<<number of items left>>.of(<<progress bar>>.of(<<shopping list app>>))');
            });
        });

        describe('elements that', () => {

            it('are being located', () => {
                expect(ShoppingList.items().toString())
                    .to.equal('<<items>>.of(<<shopping list app>>)');
            });

            it('are nested', () => {
                expect(ShoppingList.boughtItems().toString())
                    .to.equal('<<bought items>>.of(<<shopping list>>)');
            });
        });
    });

    describe.only('when iterating over page elements', () => {

        beforeEach(() =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/advanced_shopping_list.html'),
            ));

        it('lets the actor perform a given task for each one of them', () =>
            actorCalled('Elle').attemptsTo(

                Ensure.that(
                    Text.ofAll(AdvancedShoppingList.items()),
                    equals(['oats x', 'coconut milk x', 'coffee x'])
                ),
                Ensure.that(
                    Text.ofAll(AdvancedShoppingList.items().where(CssClasses, contain('buy'))),
                    equals(['oats x', 'coconut milk x'])
                ),

                AdvancedShoppingList.items()
                    .forEach(({ item, actor }) => actor.attemptsTo(
                        Click.on(LinkTo(item))
                    )),

                Ensure.that(
                    Text.ofAll(AdvancedShoppingList.items().where(CssClasses, contain('buy'))),
                    equals(['coffee x'])
                ),
            ));
    });

    describe('when filtering a list of page elements', () => {

        beforeEach(() =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/advanced_shopping_list.html'),
            ));

        describe('and no filters are applied', () => {

            describe('lets the actor interact with the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(AdvancedShoppingList.titles().count(), equals(3)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.ofAll(AdvancedShoppingList.titles()), contain('coconut milk')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(AdvancedShoppingList.titles().first()), equals('oats')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(AdvancedShoppingList.titles().last()), equals('coffee')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(AdvancedShoppingList.titles().get(1)), equals('coconut milk')),
                    ));
            });
        });

        describe('provides a sensible description when it', () => {

            it('returns the number of items', () =>
                expect(AdvancedShoppingList.items().count().toString())
                    .to.equal('the number of shopping list items'));

            it('picks all the items', () =>
                expect(AdvancedShoppingList.items().toString())
                    .to.equal('shopping list items'));

            it('picks the first item', () =>
                expect(AdvancedShoppingList.items().first().toString())
                    .to.equal('the first of shopping list items'));

            it('picks the last item', () =>
                expect(AdvancedShoppingList.items().last().toString())
                    .to.equal('the last of shopping list items'));

            given([
                { description: '1st', index: 0 },
                { description: '2nd', index: 1 },
                { description: '3rd', index: 2 },
                { description: '4th', index: 3 },
                { description: '5th', index: 4 },
                { description: '10th', index: 9 },
                { description: '11th', index: 10 },
                { description: '20th', index: 19 },
                { description: '42nd', index: 41 },
                { description: '115th', index: 114 },
                { description: '1522nd', index: 1521 },
            ]).
            it('picks the nth item', ({ description, index }) => {
                expect(AdvancedShoppingList.items().get(index).toString())
                    .to.equal(`the ${ description } of shopping list items`);
            });
        });

        describe('and a filter is applied', () => {

            const list = AdvancedShoppingList.items()
                .where(CssClasses, contain('buy'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(2)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('oats')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(1)), startsWith('coconut milk')),
                    ));
            });

            describe('provides a sensible description when it', () => {

                it('returns the number of items', () =>
                    expect(list.count().toString())
                        .to.equal(`the number of shopping list items where CssClasses does contain 'buy'`));

                it('picks all the items', () =>
                    expect(list.toString())
                        .to.equal(`shopping list items where CssClasses does contain 'buy'`));

                it('picks the first item', () =>
                    expect(list.first().toString())
                        .to.equal(`the first of shopping list items where CssClasses does contain 'buy'`));

                it('picks the last item', () =>
                    expect(list.last().toString())
                        .to.equal(`the last of shopping list items where CssClasses does contain 'buy'`));

                given([
                    { description: '1st', index: 0 },
                    { description: '2nd', index: 1 },
                    { description: '3rd', index: 2 },
                    { description: '4th', index: 3 },
                    { description: '5th', index: 4 },
                    { description: '10th', index: 9 },
                    { description: '11th', index: 10 },
                    { description: '20th', index: 19 },
                    { description: '42nd', index: 41 },
                    { description: '115th', index: 114 },
                    { description: '1522nd', index: 1521 },
                ]).
                it('picks the nth item', ({ description, index }) => {
                    expect(list.get(index).toString()).to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy'`);
                });
            });
        });

        describe('and multiple filters are applied', () => {

            const list = AdvancedShoppingList.items()
                .where(CssClasses, contain('buy'))
                .where(Text, startsWith('coconut'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(1)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('coconut milk')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(0)), startsWith('coconut milk')),
                    ));
            });

            describe('provides a sensible description when it', () => {

                it('returns the number of answers', () =>
                    expect(list.count().toString())
                        .to.equal(`the number of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));

                it('picks all the items', () =>
                    expect(list.toString())
                        .to.equal(`shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));

                it('picks the first item', () =>
                    expect(list.first().toString())
                        .to.equal(`the first of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));

                it('picks the last item', () =>
                    expect(list.last().toString())
                        .to.equal(`the last of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));

                given([
                    { description: '1st', index: 0 },
                    { description: '2nd', index: 1 },
                    { description: '3rd', index: 2 },
                    { description: '4th', index: 3 },
                    { description: '5th', index: 4 },
                    { description: '10th', index: 9 },
                    { description: '11th', index: 10 },
                    { description: '20th', index: 19 },
                    { description: '42nd', index: 41 },
                    { description: '115th', index: 114 },
                    { description: '1522nd', index: 1521 },
                ]).
                it('picks the nth item', ({ description, index }) => {
                    expect(list.get(index).toString())
                        .to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`);
                });
            });
        });

        describe('and interacting with elements on screen', () => {

            it('makes it easy for an actor to pick the element of interest', () =>
                actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(CssClasses.of(ItemCalled('coffee')), contain('buy')),
                ));

            it('makes it easy for an actor to pick all elements of interest', () =>
                actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/questions/page-elements/advanced_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coconut milk'))),
                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coffee x' ])),
                ));
        });
    });
});
