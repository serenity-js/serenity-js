import { PageElement, PageElements } from '@serenity-js/web';

export class TodoList {
    static newTodoInput =
        PageElement.locatedByCss('.new-todo')
            .describedAs('"What needs to be done?" input box')
    ;

    static editTodoInput =
        PageElement.locatedByCss('.todo-list li.editing .edit').describedAs('edit field');

    static items =
        PageElements.locatedByCss('.todo-list li').describedAs('list of items');

    static itemCalled = (name: string) =>
        TodoList.items
            .filter(async (item: PageElement) => {
                const text = await item.text();
                return text === name;
            })
            .first()
            .describedAs(`item called '${ name }'`);
}
