import {Performable} from "../../../serenity_screenplay/performable";
import {PerformsTasks} from "../../../serenity_screenplay/performs_tasks";
import {Open} from "../../../serenity_screenplay/actions/open";
import {AddTodoItems} from "./add_todo_items";
import {listOf} from "../../../text_functions";

export class Start implements Performable {
    public static withAnEmptyTodoList() : Start {
        return new Start([]);
    }

    public static withATodoListContaining(comma_separated_items: string) : Start {
        return new Start(listOf(comma_separated_items));
    }

    performAs(actor:PerformsTasks) {
        actor.attemptsTo(
            Open.browserOn("http://todomvc.com/examples/angularjs/"),       // hard-coded for now.
            AddTodoItems.called(this.initial_items)
        )
    }

    constructor(initial_items: string[]) {
        this.initial_items = initial_items;
    }

    private initial_items:string[];
}
