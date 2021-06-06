import { contain, Ensure, equals, property } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, engage } from '@serenity-js/core';

import { Actors } from './support';
import { ClearLocalStorage, RecordedItems, RecordItem, RemoveItem, RenameItem, Start } from './support/screenplay';

describe('Managing a Todo List', () => {

    beforeEach(() => engage(new Actors()));

    afterEach(() => actorInTheSpotlight().attemptsTo(
        ClearLocalStorage(),
    ));

    describe('TodoMVC', () => {

        describe('actor', () => {

            it('records new items', () => actorCalled('Jasmine').attemptsTo(
                Start.withAnEmptyList(),
                RecordItem.called('Walk a dog'),
                Ensure.that(RecordedItems(), contain('Walk a dog')),
            ));

            it('removes the recorded items', () => actorCalled('Jasmine').attemptsTo(
                Start.withAListContaining('Walk a dog'),
                RemoveItem.called('Walk a dog'),
                Ensure.that(RecordedItems(), property('length', equals(0))),
            ));

            // it('marks an item as completed', function (this: WithStage) {
            //     return this.stage.theActorCalled('Jasmine').attemptsTo(
            //         Start.withAListContaining('Buy a cake'),
            //         ToggleItem.called('Buy a cake'),
            //     );
            // });

            it('edits an item', () => actorCalled('Jasmine').attemptsTo(
                Start.withAListContaining('Buy a cake'),
                RenameItem.called('Buy a cake').to('Buy an apple'),
                Ensure.that(RecordedItems(), contain('Buy an apple')),
            ));
        });
    });
});
