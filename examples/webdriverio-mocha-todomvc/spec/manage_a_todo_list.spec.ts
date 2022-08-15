import { contain, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { ClearLocalStorage, RecordedItems, RecordItem, RemoveItem, RenameItem, Start, ToggleItem } from '../src';

describe('Managing a Todo List', () => {

    afterEach(() =>
        actorInTheSpotlight().attemptsTo(
            ClearLocalStorage(),
        ));

    describe('TodoMVC', () => {

        describe('actor', () => {

            it('records new items', () =>
                actorCalled('Wendy').attemptsTo(
                    Start.withAnEmptyList(),
                    RecordItem.called('Walk a dog'),
                    Ensure.that(RecordedItems.names, contain('Walk a dog')),
                ));

            it('removes the recorded items', () =>
                actorCalled('Wendy').attemptsTo(
                    Start.withAListContaining('Walk a dog'),
                    RemoveItem.called('Walk a dog'),
                    Ensure.that(RecordedItems.count, equals(0)),
                ));

            it('marks an item as completed', () =>
                actorCalled('Wendy').attemptsTo(
                    Start.withAListContaining('Buy a cake'),
                    ToggleItem.called('Buy a cake'),
                ));

            it('edits an item', () =>
                actorCalled('Wendy').attemptsTo(
                    Start.withAListContaining('Buy a cake'),
                    RenameItem.called('Buy a cake').to('Buy an apple'),
                    Ensure.that(RecordedItems.names, contain('Buy an apple')),
                ));
        });
    });
});
