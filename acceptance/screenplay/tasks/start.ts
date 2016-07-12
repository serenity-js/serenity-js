import { Open } from '../../../src/screenplay-protractor/actions/open';
import { step } from '../../../src/screenplay/recording/annotations';
import { PerformsTasks } from '../../../src/serenity/screenplay/actor';
import { Task } from '../../../src/serenity/screenplay/performables';
import { listOf } from '../../text_functions';
import { AddTodoItems } from './add_todo_items';

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
