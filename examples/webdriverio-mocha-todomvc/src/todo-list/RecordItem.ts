import { Answerable, Task, Wait } from '@serenity-js/core';
import { Enter, isClickable, Key, Press } from '@serenity-js/web';

import { TodoList } from './ui';

export class RecordItem {
    static called = (name: Answerable<string>) =>
        Task.where(`#actor adds an item called "${ name }"`,
            Wait.until(TodoList.newTodoInput, isClickable()),
            Enter.theValue(name).into(TodoList.newTodoInput),
            Press.the(Key.Enter).in(TodoList.newTodoInput),
        )
}
