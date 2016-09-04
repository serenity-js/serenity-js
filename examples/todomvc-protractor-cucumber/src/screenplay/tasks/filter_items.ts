import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Click, step } from 'serenity-js/lib/screenplay-protractor';

import { TodoList } from '../user_interface';

export class FilterItems implements Task {
    static toShowOnly(taskType: string) {
        return new FilterItems(taskType);
    }

    @step('{0} filters the list to show #taskType items')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Click.on(TodoList.Filter.of(this.taskType)
                .called(`filter to show ${ this.taskType } items`))
        );
    }

    constructor(private taskType: string) {
    }
}
