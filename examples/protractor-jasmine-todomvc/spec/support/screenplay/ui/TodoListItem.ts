import { By, PageElement } from '@serenity-js/web';

export class TodoListItem {
    static label = PageElement.located(By.tagName('label')).describedAs(`label`);

    static toggleButton = PageElement.located(By.css('input.toggle')).describedAs(`toggle button`);

    static destroyButton = PageElement.located(By.css('button.destroy')).describedAs(`destroy button`);

    static editItemNameInput = PageElement.located(By.css('.edit')).describedAs(`edit item name input`);
}
