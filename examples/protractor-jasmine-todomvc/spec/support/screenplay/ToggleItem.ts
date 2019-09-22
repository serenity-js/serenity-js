import { Duration, Task } from '@serenity-js/core';
import { Clear, Click, DoubleClick, Enter, Hover, Press, Wait } from '@serenity-js/protractor';
import { protractor } from 'protractor';
import { TodoList } from './ui';
import { TodoListItem } from './ui/TodoListItem';

export class ToggleItem {
    static called = (name: string) =>
            Task.where(`#actor toggles an item called "${ name }"`,
                Click.on(TodoListItem.editItemNameInput.of(TodoList.itemCalled(name))),
            )
}
