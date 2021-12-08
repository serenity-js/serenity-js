import { PageElement, PageElements } from '@serenity-js/web';

export class TodoList {
    static newTodoInput = PageElement.locatedByCss('.new-todo').describedAs('"What needs to be done?" input box');

    static editTodoInput = PageElement.locatedByCss('.todo-list li.editing .edit').describedAs('"What needs to be done?" input box');

    static items = PageElements.locatedByCss('.todo-list li').describedAs('List of Items');

    static itemCalled = (name: string) =>
        TodoList.items
            .filter(async element => {
                const text = await element.text();
                return text.includes(name);
            })
            .first();
}
