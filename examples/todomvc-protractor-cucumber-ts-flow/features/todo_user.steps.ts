import { binding, given, then, when } from 'cucumber-tsflow';
import { Serenity } from 'serenity-bdd';
import { Actors, AddATodoItem, Start, TodoListItems } from 'todomvc-screenplay';

import { expect } from '../src/expect';
import { listOf } from '../src/text';

/**
 * The cucumber steps are defined using the cucumber-ts-flow library:
 *  https://github.com/timjroberts/cucumber-js-tsflow
 */
@binding()
class TodoUserSteps {

    /**
     * Initializes Serenity with a Cast of Actors, specific to the domain
     *
     * @type {Stage}
     */
    private stage = Serenity.callToStageFor(new Actors());

    /**
     *
     * @param name
     *
     * @return {Promise<void>}
     *  Every step returns a promise. This way Serenity JS can synchronise
     *  asynchronous tasks without requiring you to explicitly invoke callbacks
     *  and pass them around.
     */
    @given(/^.*that (.*) has an empty todo list$/)
    starts_with_an_empty_list (name: string) {

        return this.stage.theActorCalled(name).attemptsTo(
            Start.withAnEmptyTodoList()
        );
    };

    @given(/^.*that (.*) has a todo list containing (.*)$/)
    has_a_list_with (name: string, items: string) {

        return this.stage.theActorCalled(name).attemptsTo(
            Start.withATodoListContaining(items)
        );
    }

    @when(/^s?he adds '(.*?)' to (?:his|her) list$/)
    adds (itemName: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            AddATodoItem.called(itemName)
        );
    }

    @then(/^'(.*?)' should be recorded in his list$/)
    should_see_todo_list_with_just_one (item: string): PromiseLike<any> {

        /**
         * Steps can be aliased and reused to improve the readability
         * of the scenarios
         */
        return this.should_see_todo_list_with_following(item);
    }

    @then(/^.* todo list should contain (.*?)$/)
    should_see_todo_list_with_following (items: string): PromiseLike<any> {

        return expect(this.stage.theActorInTheSpotlight().toSee(TodoListItems.displayed()))
            .eventually.eql(listOf(items));
    }
}

export = TodoUserSteps;
