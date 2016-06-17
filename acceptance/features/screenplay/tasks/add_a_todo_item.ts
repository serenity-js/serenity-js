import {Performable} from "../../../serenity_screenplay/performable";
import {Enter} from "../../../serenity_screenplay/actions/enter";
import {TodoList} from "../user_interface/todo_list";
import {PerformsTasks} from "../../../serenity_screenplay/performs_tasks";

export class AddATodoItem implements Performable {

    public static called(name: string) : AddATodoItem {
        return new AddATodoItem(name);
    }

    performAs(actor:PerformsTasks):Promise<void> {
        return actor.attemptsTo(
            Enter.theValue(this.name).into(TodoList.What_Needs_To_Be_Done).thenHit(protractor.Key.ENTER)
        )
    }

    constructor(name: string) {
        this.name = name;
    }

    private name:string;
}