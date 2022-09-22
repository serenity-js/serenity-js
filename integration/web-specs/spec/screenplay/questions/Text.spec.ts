import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, includes } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

describe('Text', () => {

    describe('of', () => {

        const header = PageElement.located(By.css('h1')).describedAs('the header');

        /** @test {Text.of} */
        it('allows the actor to read the text of the DOM element matching the locator', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/text/hello_world.html'),

                Ensure.that(Text.of(header), equals('Hello World!')),
            ));

        /** @test {Text#toString} */
        describe('toString', () => {

            const sections  = PageElements.located(By.css('section')).describedAs('sections');
            const section   = PageElement.located(By.css('section')).describedAs('a section');
            const heading   = PageElement.located(By.css('h1')).describedAs('the heading');

            it('provides a human-readable description of a regular question', () => {
                const description = Text.of(heading).toString();

                expect(description).to.equal('the text of the heading')
            });

            it('allows for the description to be altered', () => {
                const description = Text.of(heading).describedAs('article title').toString();

                expect(description).to.equal('article title')
            });

            it('provides a human-readable description of the meta-question', () => {
                const description = Text.of(heading).of(section).toString();

                expect(description).to.equal('the text of the heading of a section')
            });

            it('provides a human-readable description of a reqular question used in a filter', () => {
                const found = sections.where(Text, includes('5 things every tester should know'));

                const description = found.toString();

                expect(description).to.equal(`sections where Text does include '5 things every tester should know'`)
            });

            it('provides a human-readable description of a meta-question used in a filter', () => {
                const found = sections
                    .where(Text.of(heading), includes('5 things every tester should know'));

                const description = found.toString();

                expect(description).to.equal(`sections where the text of the heading does include '5 things every tester should know'`)
            });
        });

        describe('when mapping', () => {

            /** @test {Text.of} */
            /** @test {Text#map} */
            it('allows for the answer to be mapped to another type', () =>
                actorCalled('Wendy').attemptsTo(

                    Navigate.to('/screenplay/questions/text/single_number_example.html'),

                    Ensure.that(Text.of(header).as(Number), equals(2)),
                ));

            /** @test {Text.of} */
            /** @test {Text#map} */
            it('allows for the transformations to be chained', () =>
                actorCalled('Wendy').attemptsTo(

                    Navigate.to('/screenplay/questions/text/date_example.html'),

                    Ensure.that(
                        Text.of(header).trim().as(value => new Date(value)),
                        equals(new Date('2020-09-11T19:53:18.160Z'))
                    ),
                ));
        });
    });

    describe('ofAll', () => {

        const body = PageElement.located(By.css('body')).describedAs('body');
        const shoppingListItems = PageElements.located(By.css('li')).describedAs('the shopping list items');

        /** @test {Text.ofAll} */
        it('allows the actor to read the text of all DOM elements matching the locator', () =>
            actorCalled('Wendy').attemptsTo(

                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(Text.ofAll(shoppingListItems), equals(['milk', 'oats'])),
            ));

        /** @test {Text.ofAll} */
        it('allows for a question relative to another target to be asked', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(
                    Text.ofAll(shoppingListItems.of(body)),
                    equals(['milk', 'oats'])
                ),
            ));

        /** @test {Text#toString} */
        describe('toString', () => {

            const shoppingList = PageElement.located(By.css('section')).describedAs('the shopping list');
            const reviews = PageElements.located(By.css('li.review')).describedAs('reviews');

            it('provides a human-readable description of a regular question', () => {
                const description = Text.ofAll(shoppingListItems).toString();

                expect(description).to.equal('the text of the shopping list items')
            });

            it('allows for the description to be altered', () => {
                const description = Text.ofAll(shoppingListItems).describedAs('things to buy').toString();

                expect(description).to.equal('things to buy')
            });

            it('provides a human-readable description of the meta-question', () => {
                const description = Text.ofAll(shoppingListItems).of(shoppingList).toString();

                expect(description).to.equal('the text of the shopping list items of the shopping list')
            });

            it('provides a human-readable description of a reqular question used in a filter', () => {
                const found = shoppingListItems.where(Text, includes('coconut oil'));

                const description = found.toString();

                expect(description).to.equal(`the shopping list items where Text does include 'coconut oil'`)
            });

            it('provides a human-readable description of a meta-question used in a filter', () => {
                const found = shoppingListItems
                    .where(Text.ofAll(reviews), contain('great purchase'));

                const description = found.toString();

                expect(description).to.equal(`the shopping list items where the text of reviews does contain 'great purchase'`)
            });
        });

        /** @test {Text.ofAll} */
        /** @test {Text#map} */
        it('allows for the answer to be mapped', () =>
            actorCalled('Wendy').attemptsTo(

                Navigate.to('/screenplay/questions/text/percentages.html'),

                Ensure.that(
                    Text
                        .ofAll(
                            PageElements.located(By.css('#answers li')).describedAs('possible answers')
                        )
                        .map((answer: string) => answer.trim())
                        .map((answer: string) => answer.replace('%', ''))
                        .map(Number),
                    equals([6.67, 3.34])
                ),
            ));
    });
});
