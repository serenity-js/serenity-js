import { listOf } from '../../text';
import { TodoListItems } from '../screenplay/questions/todo_list_items';
import { AddATodoItem } from '../screenplay/tasks/add_a_todo_item';
import { Start } from '../screenplay/tasks/start';

import { binding, given, then, when } from 'cucumber-tsflow';
import { Actor, BrowseTheWeb } from 'serenity/lib/screenplay-protractor';

import expect = require('../../../spec/expect');

@binding()
class TodoUserSteps {

    private james: Actor = Actor.named('James').whoCan(BrowseTheWeb.using(browser));

    @given(/^.*has an empty todo list$/)
    starts_with_an_empty_list () {
        return this.james.attemptsTo(
            Start.withAnEmptyTodoList()
        );
    };

    @given(/^.*has a todo list containing (.*)$/)
    has_a_list_with (items: string) {
        return this.james.attemptsTo(
            Start.withATodoListContaining(items)
        );
    }

    @when(/^s?he adds '(.*?)' to (?:his|her) list$/)
    adds (itemName: string) {
        return this.james.attemptsTo(
            AddATodoItem.called(itemName)
        );
    }

    @then(/^'(.*?)' should be recorded in his list$/)
    should_see_todo_list_with_just_one (item: string): PromiseLike<any> {

        return this.should_see_todo_list_with_following(item);
    }

    @then(/^.* todo list should contain (.*?)$/)
    should_see_todo_list_with_following (items: string): PromiseLike<any> {
        return expect(this.james.toSee(TodoListItems.displayed())).eventually.eql(listOf(items));
    }
}

export = TodoUserSteps;
