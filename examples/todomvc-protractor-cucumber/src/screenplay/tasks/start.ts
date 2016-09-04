import { Open, PerformsTasks, ResizeBrowserWindow, Task, step } from 'serenity-js/lib/screenplay-protractor';

import { AddTodoItems } from './add_todo_items';

export class Start implements Task {
    public static withAnEmptyTodoList(): Start {
        return new Start();
    }

    public static withATodoListContaining(items: string[]): Start {
        return new Start(items);
    }

    @step('{0} starts with a todo list containing #todoListDescription')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Open.browserOn('/examples/angularjs/'),
            ResizeBrowserWindow.toMaximum(),
            AddTodoItems.called(this.initialItems)
        );
    }

    constructor(private initialItems: string[] = []) {
    }

    public todoListDescription(): string {
        return !! this.initialItems.length
            ? `"${ this.initialItems.join('", "') }"`
            : 'no items';
    }
}
