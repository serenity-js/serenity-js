import 'mocha';

import { contain, Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { Navigate, PageElement, PageElements, Text } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { given } from 'mocha-testdata';

/** @test {PageElements} */
describe('PageElements', () => {

    class ShoppingList {
        static app = () =>
            PageElement.locatedById('shopping-list-app')
                .describedAs('shopping list app');

        static progress = () =>
            PageElement.locatedByCss('.progress')
                .describedAs('progress bar')
                .of(ShoppingList.app());

        static numberOfItemsLeft = () =>
            PageElement.locatedByCss('span')
                .describedAs('number of items left')
                .of(ShoppingList.progress());

        static header = () =>
            PageElement.locatedByTagName('h1').describedAs('header');

        static list = () =>
            PageElement.locatedByTagName('ul').describedAs('shopping list');

        static items = () =>
            PageElements.locatedByTagName('li')
                .describedAs('items')
                .of(ShoppingList.app());

        static boughtItems = () =>
            PageElements.locatedByCss('.bought')
                .describedAs('bought items')
                .of(ShoppingList.list());
    }

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

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


        it('an element relative to another target', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/shopping_list.html'),

                Ensure.that(ShoppingList.numberOfItemsLeft().text().as(Number), equals(2)),
            ));

        it('all elements relative to another target', () =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

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

    describe('when filtering a list of targets', () => {

        class AdvancedShoppingList {
            static items = () =>
                PageElements.locatedByCss('li').describedAs('shopping list items');

            static item = () =>
                PageElement.locatedByCss('li').describedAs('shopping list item');

            static titles = () =>
                PageElements.locatedByCss('li span.item-name').describedAs('shopping list item titles');

            static itemName = () =>
                PageElement.locatedByCss('span.item-name').describedAs('item name');

            static itemNames = () =>
                PageElements.locatedByCss('span.item-name').describedAs('item names');
        }

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
    });
});
