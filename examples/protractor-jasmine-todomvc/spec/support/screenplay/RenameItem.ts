import { Task } from '@serenity-js/core';
import { Clear, DoubleClick, Enter, Press } from '@serenity-js/protractor';
import { protractor } from 'protractor';
import { TodoList, TodoListItem } from './ui';

export class RenameItem {
    static called = (name: string) => ({
        to: (newName: string) =>
            Task.where(`#actor renames an item called "${ name }" to "${ newName }"`,
                DoubleClick.on(TodoListItem.label.of(TodoList.itemCalled(name))),
                Clear.theValueOf(TodoList.editTodoInput),
                Enter.theValue(newName).into(TodoList.editTodoInput),
                Press.the(protractor.Key.ENTER).in(TodoList.editTodoInput),
            ),
    })
}
