import { expect } from '../src/expect';
import { Serenity } from 'serenity-bdd';
import { Actors, AddATodoItem, Start, TodoListItems } from 'todomvc-screenplay';

describe('Record Todos:', () => {

    let stage = Serenity.callToStageFor(new Actors());

    it('can add new items to an empty list', () => {
        let james = stage.theActorCalled('james');

        return james.attemptsTo(
            Start.withAnEmptyTodoList(),
            AddATodoItem.called('Buy some milk')
        )
        .then(() =>
            expect(james.toSee(TodoListItems.displayed()))
                .eventually.eql([ 'Buy some milk' ])
        );
    });
});
