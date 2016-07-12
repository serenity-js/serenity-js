import { Enter } from '../../../src/screenplay-protractor/actions/enter';
import { step } from '../../../src/screenplay/recording/annotations';
import { PerformsTasks } from '../../../src/serenity/screenplay/actor';
import { Task } from '../../../src/serenity/screenplay/performables';
import { TodoList } from '../user_interface/todo_list';

export class AddATodoItem implements Task {

    public static called(name: string): AddATodoItem {
        return new AddATodoItem(name);
    }

    @step('{0} adds a todo item called: #name')
    performAs(actor: PerformsTasks): Promise<void> {
        return actor.attemptsTo(
            Enter.theValue(this.name).into(TodoList.What_Needs_To_Be_Done).thenHit(protractor.Key.ENTER)
        );
    }

    constructor(public name: string) {
    }
}
