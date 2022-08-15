import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { TodoList, TodoListItem } from './ui';

export class ToggleItem {
    static called = (name: string) =>
        Task.where(`#actor toggles an item called "${ name }"`,
            Click.on(
                TodoListItem.toggleButton.of(TodoList.itemCalled(name))
                    .describedAs(`toggle button of ${ name }`),
            ),
        );
}
