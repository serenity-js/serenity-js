import { Serenity } from 'serenity-js';
import { Actors, AddATodoItem, Start } from 'todomvc-model';
import { Ensure } from '../../src/tasks/ensure';

describe('Managing a Todo List', function() {
    this.timeout(10000);

    const stage = Serenity.callToStageFor(new Actors());

    describe('James can add an item when his list', () => {

        it('is empty', () => stage.theActorCalled('James').attemptsTo(
            Start.withAnEmptyTodoList(),
            AddATodoItem.called('Buy some milk'),
            Ensure.theListIncludes('Buy some milk'),
        ));

        it('already contains other items', () => stage.theActorCalled('James').attemptsTo(
            Start.withATodoListContaining([ 'Buy some cookies', 'Walk the dog' ]),
            AddATodoItem.called('Buy some milk'),
            Ensure.theListOnlyContains(
                'Buy some cookies',
                'Walk the dog',
                'Buy some milk',
            ),
        ));
    });
});
