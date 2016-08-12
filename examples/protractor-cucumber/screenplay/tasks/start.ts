import { listOf } from '../../../text';
import { AddTodoItems } from './add_todo_items';
import { Open, PerformsTasks, Task, step } from 'serenity-bdd/lib/screenplay-protractor';

export class Start implements Task {
    public static withAnEmptyTodoList(): Start {
        return new Start();
    }

    public static withATodoListContaining(comma_separated_items: string): Start {
        return new Start(listOf(comma_separated_items));
    }

    @step('{0} starts with a todo list containing #todoListDescription')
    performAs(actor: PerformsTasks): Promise<void> {
        return actor.attemptsTo(
            Open.browserOn('http://todomvc.dev/examples/angularjs/'),       // fixme: should be configurable
            AddTodoItems.called(this.initialItems)
        );
    }

    constructor(private initialItems: string[] = []) {
    }

    public todoListDescription(): string {
        return !!this.initialItems.length ? this.initialItems.join(', ') : 'no items';
    }
}
