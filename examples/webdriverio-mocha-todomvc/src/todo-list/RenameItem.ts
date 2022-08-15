import { Task } from '@serenity-js/core';
import { Clear, DoubleClick, Enter, Key, Press } from '@serenity-js/web';

import { TodoList, TodoListItem } from './ui';

export class RenameItem {
    static called = (name: string) => ({
        to: (newName: string) =>
            Task.where(`#actor renames an item called "${ name }" to "${ newName }"`,
                DoubleClick.on(TodoListItem.label.of(TodoList.itemCalled(name))),
                Clear.theValueOf(TodoList.editTodoInput),
                Enter.theValue(newName).into(TodoList.editTodoInput),
                Press.the(Key.Enter).in(TodoList.editTodoInput),
            ),
    })
}
