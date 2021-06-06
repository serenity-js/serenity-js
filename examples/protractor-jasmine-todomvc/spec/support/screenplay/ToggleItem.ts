import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/protractor';

import { TodoList } from './ui';
import { TodoListItem } from './ui/TodoListItem';

export class ToggleItem {
    static called = (name: string): Task =>
        Task.where(`#actor toggles an item called "${ name }"`,
            Click.on(TodoListItem.editItemNameInput.of(TodoList.itemCalled(name))),
        )
}
