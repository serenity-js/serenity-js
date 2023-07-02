import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Actor, actorCalled, Answerable, AssertionError, Duration, Interaction, notes, QuestionAdapter, Timestamp, Wait } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { By, Click, CssClasses, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';
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

class DynamicShoppingList {
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
    DynamicShoppingList.items()
        .where(Text.of(DynamicShoppingList.itemName()), equals(name))
        .first();

const ItemsLeftToBuy = () =>
    DynamicShoppingList.items()
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
                Navigate.to('/screenplay/models/page-elements/shopping_list.html'),

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
                    .to.equal('number of items left of progress bar of shopping list app');
            });
        });

        describe('elements that', () => {

            it('are being located', () => {
                expect(ShoppingList.items().toString())
                    .to.equal('items of shopping list app');
            });

            it('are nested', () => {
                expect(ShoppingList.boughtItems().toString())
                    .to.equal('bought items of shopping list');
            });
        });
    });

    describe('when iterating over page elements', () => {

        beforeEach(() =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),
            ));

        it('lets the actor perform a given task for each one of them', () =>
            actorCalled('Elle').attemptsTo(
                Ensure.that(
                    Text.ofAll(
                        DynamicShoppingList
                            .items()
                            .eachMappedTo(DynamicShoppingList.itemName())
                    ),
                    equals([ 'oats', 'coconut milk', 'coffee' ])
                ),
                Ensure.that(
                    Text.ofAll(
                        DynamicShoppingList
                            .items()
                            .where(CssClasses, contain('buy'))
                            .eachMappedTo(DynamicShoppingList.itemName())
                    ),
                    equals([ 'oats', 'coconut milk' ])
                ),

                DynamicShoppingList.items()
                    .forEach(({ item, actor }) => actor.attemptsTo(
                        Click.on(LinkTo(item))
                    )),

                Ensure.that(
                    Text.ofAll(
                        DynamicShoppingList.items()
                            .where(CssClasses, contain('buy'))
                            .eachMappedTo(DynamicShoppingList.itemName())
                    ),
                    equals([ 'coffee' ])
                ),
            ));
    });

    describe('when filtering a list of page elements', () => {

        beforeEach(() =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),
            ));

        describe('and no filters are applied', () => {

            describe('lets the actor interact with the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(DynamicShoppingList.titles().count(), equals(3)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.ofAll(DynamicShoppingList.titles()), contain('coconut milk')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(DynamicShoppingList.titles().first()), equals('oats')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(DynamicShoppingList.titles().last()), equals('coffee')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Elle').attemptsTo(
                        Ensure.that(Text.of(DynamicShoppingList.titles().nth(1)), equals('coconut milk')),
                    ));
            });
        });

        describe('provides a sensible description when it', () => {

            it('returns the number of items', () =>
                expect(DynamicShoppingList.items().count().toString())
                    .to.equal('the number of shopping list items'));

            it('picks all the items', () =>
                expect(DynamicShoppingList.items().toString())
                    .to.equal('shopping list items'));

            it('picks the first item', () =>
                expect(DynamicShoppingList.items().first().toString())
                    .to.equal('the first of shopping list items'));

            it('picks the last item', () =>
                expect(DynamicShoppingList.items().last().toString())
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
                expect(DynamicShoppingList.items().nth(index).toString())
                    .to.equal(`the ${ description } of shopping list items`);
            });
        });

        describe('and a filter is applied', () => {

            const list = DynamicShoppingList.items()
                .where(CssClasses, contain('buy'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(list.count(), equals(2)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('oats')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.nth(1)), startsWith('coconut milk')),
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
                ]).it('picks the nth item', ({ description, index }) => {
                    expect(list.nth(index).toString()).to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy'`);
                });
            });
        });

        describe('and multiple filters are applied', () => {

            const list = DynamicShoppingList.items()
                .where(CssClasses, contain('buy'))
                .where(Text, startsWith('coconut'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(list.count(), equals(1)),
                    ));

                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('coconut milk')),
                    ));

                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                        Ensure.that(Text.of(list.nth(0)), startsWith('coconut milk')),
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
                    expect(list.nth(index).toString())
                        .to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`);
                });
            });
        });

        describe('and interacting with elements on screen', () => {

            it('makes it easy for an actor to pick the element of interest', () =>
                actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(CssClasses.of(ItemCalled('coffee')), contain('buy')),
                ));

            it('makes it easy for an actor to pick all elements of interest', () =>
                actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/dynamic_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coconut milk'))),
                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coffee x' ])),
                ));
        });
    });

    describe('when accessing lazy loaded lists', () => {

        const loadButton = PageElement.located(By.id('load')).describedAs('button to load the list');

        beforeEach(() =>
            actorCalled('Elle').attemptsTo(
                Navigate.to('/screenplay/models/page-elements/lazy_loaded_shopping_list.html'),
            ));

        it('waits until the lazy loaded shopping list contains items', () =>
            actorCalled('Elle').attemptsTo(
                Click.on(loadButton),
                Wait.upTo(Duration.ofSeconds(10))
                    .until(Text.of(ShoppingList.items().first()), equals('coffee')),
                Ensure.that(Text.of(ShoppingList.items().nth(1)), equals('oats'))
            ));

        it('fails the actors flow when the lazy loaded shopping list does not load within time', async () => {
            const timeout = Duration.ofSeconds(1);
            const actor = actorCalled('Elle');

            try {
                await actor.attemptsTo(
                    Click.on(loadButton),
                    recordCurrentTimeAs('startTime'),
                    Wait.upTo(timeout)
                        .until(Text.of(ShoppingList.items().first()), equals('coffee')),
                );
                expect.fail('Expected actor flow to be stopped');
            }
            catch (error) {
                expect(error).to.be.instanceof(AssertionError);

                await actor.attemptsTo(
                    recordCurrentTimeAs('endTime'),
                );

                const startTime = await actor.answer(timeRecordedAs('startTime'));
                const endTime   = await actor.answer(timeRecordedAs('endTime'));

                const elapsedWallClockTime = endTime.diff(startTime);

                expect(elapsedWallClockTime.inMilliseconds()).to.be.greaterThanOrEqual(timeout.inMilliseconds());
                expect(error).to.be.instanceOf(AssertionError);
                expect(error.message).to.match(new RegExp(trimmed`
                    | Timeout of 1s has expired while waiting for the text of the first of items of shopping list app to equal 'coffee'
                    | \\s{4}at .*screenplay/models/PageElements.spec.ts:458:26`));
            }
        });
    });
});

const recordCurrentTimeAs = (label: string) =>
    Interaction.where(`#actor records current time`, async (actor: Actor) => {
        await actor.attemptsTo(
            notes().set(label, new Timestamp())
        )
    });

const timeRecordedAs = (label: string) =>
    notes().get(label) as unknown as QuestionAdapter<Timestamp>;

