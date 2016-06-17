import {Performable} from "../../../serenity_screenplay/performable";
import {Enter} from "../../../serenity_screenplay/actions/enter";
import {TodoList} from "../user_interface/todo_list";
import {PerformsTasks} from "../../../serenity_screenplay/performs_tasks";
import {AddATodoItem} from "./add_a_todo_item";

export class AddTodoItems implements Performable {

    public static called(names: string[]) : AddTodoItems {
        return new AddTodoItems(names);
    }

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