import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
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

        /** @test {Text.of} */
        /** @test {Text#toString} */
        it('produces a sensible description of the question being asked', () => {
            expect(Text.of(PageElement.located(By.css('h1')).describedAs('the header')).toString())
                .to.equal('the text of the header');
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

        const Shopping_List_Items = PageElements.located(By.css('li')).describedAs('shopping list items');

        /** @test {Text.ofAll} */
        it('allows the actor to read the text of all DOM elements matching the locator', () =>
            actorCalled('Wendy').attemptsTo(

                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(Text.ofAll(Shopping_List_Items), equals(['milk', 'oats'])),
            ));

        /** @test {Text.ofAll} */
        it('allows for a question relative to another target to be asked', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(
                    Text.ofAll(Shopping_List_Items.of(
                        PageElement.located(By.css('body')).describedAs('body')
                    )),
                    equals(['milk', 'oats'])
                ),
            ));

        /** @test {Text.ofAll} */
        /** @test {Text#toString} */
        it('produces sensible description of the question being asked', () => {
            expect(Text.ofAll(Shopping_List_Items).toString())
                .to.equal('the text of shopping list items');       // todo: the text of ALL, of THE ?
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
                        .map((answer: string) => Number(answer)),
                    equals([6.67, 3.34])
                ),
            ));
    });
});
