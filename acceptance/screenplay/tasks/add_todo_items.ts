import { step } from '../../../src/screenplay/recording/annotations';
import { PerformsTasks } from '../../../src/serenity/screenplay/actor';
import { Performable } from '../../../src/serenity/screenplay/performables';
import { AddATodoItem } from './add_a_todo_item';

export class AddTodoItems implements Performable {

    static called(names: string[]): AddTodoItems {
        return new AddTodoItems(names);
    }

    @step('{0} adds #description')
    performAs(actor: PerformsTasks) {
        actor.attemptsTo.apply(actor, this.addAllOf(this.items));       // array -> var args conversion
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