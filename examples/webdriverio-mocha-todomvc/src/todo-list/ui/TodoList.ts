import { equals } from '@serenity-js/assertions';
import { by, Target, Text } from '@serenity-js/web';

export class TodoList {
    static newTodoInput =
        Target.the('"What needs to be done?" input box')
            .located(by.css('.new-todo'));

    static editTodoInput =
        Target.the('"What needs to be done?" input box')
            .located(by.css('.todo-list li.editing .edit'));

    static items =
        Target.all('List of Items')
            .located(by.css('.todo-list li'));

    static itemCalled = (name: string) =>
        TodoList.items
            .where(Text, equals(name))
            .first();
}
