import {Performable, PerformsTasks} from "../../../../lib/screenplay/pattern";
import {step} from "../../../../lib/screenplay/reporting/annotations"

import {Open} from "../../../../lib/screenplay_protractor/actions/open";
import {AddTodoItems} from "./add_todo_items";
import {listOf} from "../../../text_functions";

export class Start implements Performable {
    public static withAnEmptyTodoList() : Start {
        return new Start([]);
    }

    public static withATodoListContaining(comma_separated_items: string) : Start {
        return new Start(listOf(comma_separated_items));
    }

    @step("{0} starts with a todo list containing #todoListDescription")
    performAs(actor:PerformsTasks) {
        actor.attemptsTo(
            Open.browserOn("http://todomvc.dev/examples/angularjs/"),       // fixme: should be configurable
            AddTodoItems.called(this.initialItems)
        )
    }

    constructor(initialItems: string[]) {
        this.initialItems = initialItems;
    }

    public todoListDescription() : string {
        return !!this.initialItems.length ? this.initialItems.join(', ') : 'no items'
    }

    private initialItems:string[];
}
