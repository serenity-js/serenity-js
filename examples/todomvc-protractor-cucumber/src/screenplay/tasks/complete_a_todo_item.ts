import { PerformsTasks, Task } from 'serenity-bdd/lib/screenplay';
import { Click, step } from 'serenity-bdd/lib/serenity-protractor';

import { TodoList } from '../user_interface';

export class CompleteATodoItem implements Task {
    static called(itemName: string) {
        return new CompleteATodoItem(itemName);
    }

    @step('{0} marks "#itemName" as completed')
    performAs(actor: PerformsTasks): Promise<void> {
        return actor.attemptsTo(
            Click.on(
                TodoList.Complete_Item_Checkbox.of(this.itemName).called(this.itemName)
            )
        );
    }

    constructor(private itemName: string) {
    }
}
