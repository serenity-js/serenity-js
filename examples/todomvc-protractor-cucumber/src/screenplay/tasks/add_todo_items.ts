import { AddATodoItem } from './add_a_todo_item';

import { Performable, PerformsTasks, Task, step } from 'serenity-js/lib/screenplay-protractor';

export class AddTodoItems implements Task {

    static called(names: string[]): AddTodoItems {
        return new AddTodoItems(names);
    }

    @step('{0} adds #description')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(...this.addAll(this.items));        // array -> var args conversion
    }

    constructor(private items: string[]) {
    }

    // used in @step as #description
    private description() {                                         // tslint:disable-line:no-unused-variable
        return !! this.items.length
            ? `todo items called: "${ this.items.join('", "') }"`
            : 'no items';
    }

    private addAll(items: string[]): Performable[] {
        return items.map((item) => AddATodoItem.called(item));
    }
}
