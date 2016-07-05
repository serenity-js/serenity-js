const
    chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect;

import {binding, given, when, then} from "cucumber-tsflow";
import {Actor} from "../../../src/screenplay/pattern/actor";
import {AddATodoItem} from "../screenplay/tasks/add_a_todo_item";
import {Start} from "../screenplay/tasks/start";
import {TodoListItems} from "../screenplay/questions/todo_list_items";
import {listOf} from "../../text_functions";

@binding()
class TodoUserSteps {

    private james: Actor = Actor.named("James");

    @given(/^.*has an empty todo list$/)
    private starts_with_an_empty_list () {

        this.james.attemptsTo(
            Start.withAnEmptyTodoList()
        );
    };

    @given(/^.*has a todo list containing (.*)$/)
    public has_a_list_with (items: string) {

        this.james.attemptsTo(
            Start.withATodoListContaining(items)
        );
    }


    @when(/^s?he adds '(.*?)' to (?:his|her) list$/)
    public adds (item_name: string) {

        this.james.attemptsTo(
            AddATodoItem.called(item_name)
        );
    }

    @then(/^'(.*?)' should be recorded in his list$/)
    public should_see_todo_list_with_just_one (item: string) : Promise<void> {

        return this.should_see_todo_list_with_following(item);
    }



    @then(/^.* todo list should contain (.*?)$/)
    public should_see_todo_list_with_following (items: string) : Promise<void> {
        // todo: report assertion errors
        return expect(TodoListItems.displayed()).to.eventually.eql(listOf(items));
    }
}

export = TodoUserSteps;