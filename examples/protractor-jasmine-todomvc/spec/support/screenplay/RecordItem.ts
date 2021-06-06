import { Task } from '@serenity-js/core';
import { Enter, Press } from '@serenity-js/protractor';
import { protractor } from 'protractor';

import { TodoList } from './ui';

export class RecordItem {
    static called = (name: string): Task =>
        Task.where(`#actor adds an item called "${ name }"`,
            Enter.theValue(name).into(TodoList.newTodoInput),
            Press.the(protractor.Key.ENTER).in(TodoList.newTodoInput),
        )
}
