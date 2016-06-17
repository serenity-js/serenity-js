// const
//     chai = require('chai').use(require('chai-as-promised')),
//     expect = chai.expect;

import {binding, given, when, then} from "cucumber-tsflow";
import {Actor} from "../../serenity_screenplay/actor";
import {Open}  from "../screenplay/tasks/open"
import {AddATodoItem} from "../screenplay/tasks/add_a_todo_item";

@binding()
class TodoUserSteps {

    private james: Actor = new Actor();

    @given(/^.*has an empty todo list$/)
    private has_an_empty_todo_list (): Promise<void> {

        return this.james.attemptsTo(
            Open.browserOn("http://todomvc.com/examples/angularjs/")
        );
    };

    @when(/^he adds '(.*?)' to (?:his|her) list$/)
    public adds (item_name: string) : Promise<void> {

        return this.james.attemptsTo(
            AddATodoItem.called(item_name)
        );
    }

    @then(/^'(.*?)' should be recorded in (?:his|her) list$/)
    public should_see_recorded (item: string) : Promise<void> {
        return Promise.resolve();
    }
}

export = TodoUserSteps;