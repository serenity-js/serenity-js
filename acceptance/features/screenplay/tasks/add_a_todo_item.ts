import {Performable, PerformsTasks} from "../../../../src/screenplay/pattern";
import {step, CaptureScreenshot} from "../../../../src/screenplay/recording/annotations";
import {Enter} from "../../../../src/screenplay_protractor/actions/enter";
import {TodoList} from "../user_interface/todo_list";

export class AddATodoItem implements Performable {

    public static called(name: string) : AddATodoItem {
        return new AddATodoItem(name);
    }

    @step("{0} adds a todo item called: #name")
    performAs(actor:PerformsTasks) {

        actor.attemptsTo(
            Enter.theValue(this.name).into(TodoList.What_Needs_To_Be_Done).thenHit(protractor.Key.ENTER)
        );
    }

    constructor(name: string) {
        this.name = name;
    }

    private name:string;
}