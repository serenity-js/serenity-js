import {Performable, PerformsTasks} from "../../../../lib/screenplay/pattern";
import {step} from "../../../../lib/screenplay/reporting/annotations";
import {AddATodoItem} from "./add_a_todo_item";

export class AddTodoItems implements Performable {

    public static called(names: string[]) : AddTodoItems {
        return new AddTodoItems(names);
    }

    @step("{0} adds the todo items called: #items")
    performAs(actor:PerformsTasks) {
        actor.attemptsTo.apply(actor, this.addAllOf(this.items));       // array -> var args conversion
    }

    private addAllOf(items: string[]) : Performable[] {
        return items.map((item) => AddATodoItem.called(item))
    }

    constructor(items: string[]) {
        this.items = items;
    }

    private items:string[];
}