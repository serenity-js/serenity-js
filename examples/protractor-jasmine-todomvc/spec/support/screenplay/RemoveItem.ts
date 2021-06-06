import { Task } from '@serenity-js/core';
import { Click, Hover } from '@serenity-js/protractor';

import { TodoList } from './ui';
import { TodoListItem } from './ui/TodoListItem';

export class RemoveItem {
    static called = (name: string): Task =>
        Task.where(`#actor removes an item called "${ name }"`,
            Hover.over(TodoList.itemCalled(name)),
            Click.on(TodoListItem.destroyButton.of(TodoList.itemCalled(name))),
        )
}
