import { AddATodoItem } from './add_a_todo_item';

import { Performable, PerformsTasks, Task, step } from 'serenity-bdd/lib/screenplay-protractor';

export class AddTodoItems implements Task {

    static called(names: string[]): AddTodoItems {
        return new AddTodoItems(names);
    }

    @step('{0} adds #description')
    performAs(actor: PerformsTasks): Promise<void> {
        return actor.attemptsTo.apply(actor, this.addAllOf(this.items));       // array -> var args conversion
    }

    constructor(private items: string[]) {
    }

    // used in @step as #description
    private description() {                                             // tslint:disable-line:no-unused-variable
        return !! this.items.length
            ? `todo items called: ${this.items.join(', ')}`
            : 'no items';
    }

    private addAllOf(items: string[]): Performable[] {
        return items.map((item) => AddATodoItem.called(item));
    }
}