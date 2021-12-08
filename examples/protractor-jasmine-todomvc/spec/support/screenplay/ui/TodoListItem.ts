import { PageElement } from '@serenity-js/web';

export class TodoListItem {
    static label = PageElement.locatedByTagName('label').describedAs(`label`);

    static toggleButton = PageElement.locatedByCss('input.toggle').describedAs(`toggle button`);

    static destroyButton = PageElement.locatedByCss('button.destroy').describedAs(`destroy button`);

    static editItemNameInput = PageElement.locatedByCss('.edit').describedAs(`edit item name input`);
}
