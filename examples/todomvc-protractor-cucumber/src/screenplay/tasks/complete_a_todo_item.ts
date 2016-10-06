import { TodoList } from '../user_interface';
import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Click, step } from 'serenity-js/lib/screenplay-protractor';

export class CompleteATodoItem implements Task {
    static called(itemName: string) {
        return new CompleteATodoItem(itemName);
    }

    @step('{0} marks "#itemName" as completed')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Click.on(
                TodoList.Complete_Item_Checkbox
                    .of(this.itemName)
                    .called(`"${ this.itemName }" checkbox`)
            )
        );
    }

    constructor(private itemName: string) {
    }
}

