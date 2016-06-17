import {TodoListItems} from "../screenplay/questions/todo_list_items";
const
    chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect;

import {binding, given, when, then} from "cucumber-tsflow";
import {Actor} from "../../serenity_screenplay/actor";
import {Open}  from "../screenplay/tasks/open"
import {AddATodoItem} from "../screenplay/tasks/add_a_todo_item";

@binding()
class TodoUserSteps {

    private james: Actor = Actor.named("james");

    @given(/^.*has an empty todo list$/)
    private has_an_empty_todo_list () {

        this.james.attemptsTo(
            Open.browserOn("http://todomvc.com/examples/angularjs/")
        );
    };

    @when(/^he adds '(.*?)' to (?:his|her) list$/)
    public adds (item_name: string) {

        this.james.attemptsTo(
            AddATodoItem.called(item_name)
        );
    }

    @then(/^'(.*?)' should be recorded in (?:his|her) list$/)
    public should_see_recorded (item: string) : Promise<void> {

        return expect(TodoListItems.displayed()).to.eventually.include(item);
    }
}

export = TodoUserSteps;