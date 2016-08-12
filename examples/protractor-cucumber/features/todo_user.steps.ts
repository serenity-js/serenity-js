import { listOf } from '../../text';
import { Actors } from '../screenplay/actors';
import { TodoListItems } from '../screenplay/questions/todo_list_items';
import { AddATodoItem } from '../screenplay/tasks/add_a_todo_item';
import { Start } from '../screenplay/tasks/start';

import { binding, given, then, when } from 'cucumber-tsflow';
import { Serenity } from 'serenity-bdd';

import expect = require('../../../spec/expect');

@binding()
class TodoUserSteps {

    private stage = Serenity.callToStageFor(new Actors());

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

        return this.should_see_todo_list_with_following(item);
    }

    @then(/^.* todo list should contain (.*?)$/)
    should_see_todo_list_with_following (items: string): PromiseLike<any> {
        return expect(this.stage.theActorInTheSpotlight().toSee(TodoListItems.displayed())).eventually.eql(listOf(items));
    }
}

export = TodoUserSteps;
