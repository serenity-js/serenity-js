import { contain, Ensure, equals, property } from '@serenity-js/assertions';
import { Interaction, WithStage } from '@serenity-js/core';
import { by, protractor } from 'protractor';
import { ClearLocalStorage, RecordedItems, RecordItem, RemoveItem, RenameItem, Start, ToggleItem } from './support/screenplay';

describe('Managing a Todo List', () => {

    afterEach(function (this: WithStage) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            ClearLocalStorage(),
        );
    });

    describe('TodoMVC', () => {

        describe('actor', () => {

            it('records new items', function (this: WithStage) {
                return this.stage.theActorCalled('Jasmine').attemptsTo(
                    Start.withAnEmptyList(),
                    RecordItem.called('Walk a dog'),
                    Ensure.that(RecordedItems(), contain('Walk a dog')),
                );
            });

            it('removes the recorded items', function (this: WithStage) {
                return this.stage.theActorCalled('Jasmine').attemptsTo(
                    Start.withAListContaining('Walk a dog'),
                    RemoveItem.called('Walk a dog'),
                    Ensure.that(RecordedItems(), property('length', equals(0))),
                );
            });

            // it('marks an item as completed', function (this: WithStage) {
            //     return this.stage.theActorCalled('Jasmine').attemptsTo(
            //         Start.withAListContaining('Buy a cake'),
            //         ToggleItem.called('Buy a cake'),
            //     );
            // });

            it('edits an item', function (this: WithStage) {
                return this.stage.theActorCalled('Jasmine').attemptsTo(
                    Start.withAListContaining('Buy a cake'),
                    RenameItem.called('Buy a cake').to('Buy an apple'),
                    Ensure.that(RecordedItems(), contain('Buy an apple')),
                );
            });

                // todo: upgrade to prot 6.0.0?

            // it('uses plain old Protractor', async function (this: WithStage) {
            //     await protractor.browser.get('http://todomvc.com/examples/angularjs/#/');
            //
            //     await protractor.element(by.css('.new-todo')).sendKeys('Walk the dog');
            //     await protractor.element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);
            //
            //     // await protractor.browser.sleep(1000);
            //
            //     // await protractor.browser.sleep(1000);
            //
            //     // protractor.element(by.xpath(`//li[*[@class='view' and contains(.,'${ 'Walk the dog' }')]]//input[contains(@class, 'edit')]`)),
            //
            //     await protractor.browser.actions()
            //         .mouseMove(
            //             protractor.element(by.xpath(`//li[*[@class='view' and contains(.,'${ 'Walk the dog' }')]]//label`)),
            //             // { x: 1, y: 1},
            //         )
            //         .perform()
            //         .then(() =>
            //             protractor.browser.actions()
            //             .doubleClick(
            //                 protractor.element(by.xpath(`//li[*[@class='view' and contains(.,'${ 'Walk the dog' }')]]//label`)),
            //             )
            //             .perform(),
            //         );
            //
            //     await protractor.browser.sleep(2000);
            // });
        });
    });
});

const Debug = () => Interaction.where(`#actor pauses execution using a debugger`, actor => {
    debugger;   // tslint:disable-line:no-debugger
});
