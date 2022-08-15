import { Task } from '@serenity-js/core';
import { Click, Hover } from '@serenity-js/web';

import { TodoList, TodoListItem } from './ui';

export class RemoveItem {
    static called = (name: string) =>
        Task.where(`#actor removes an item called "${ name }"`,
            Hover.over(TodoList.itemCalled(name)),
            Click.on(TodoListItem.destroyButton.of(TodoList.itemCalled(name))),
        )
}
