import {step, CaptureScreenshot} from "../../../src/screenplay/recording/annotations";
import {Enter} from "../../../src/screenplay_protractor/actions/enter";
import {TodoList} from "../user_interface/todo_list";
import {PerformsTasks} from "../../../src/serenity/screenplay/actor";
import {Performable} from "../../../src/serenity/screenplay/performables";

export class AddATodoItem implements Performable {

    public static called(name: string) : AddATodoItem {
        return new AddATodoItem(name);
    }

    @step("{0} adds a todo item called: #name", CaptureScreenshot.BEFORE_AND_AFTER)
    performAs(actor:PerformsTasks) {

        actor.attemptsTo(
            Enter.theValue(this.name).into(TodoList.What_Needs_To_Be_Done).thenHit(protractor.Key.ENTER)
        );
    }

    constructor(public name: string) { }
}