// import { by, Target } from '@serenity-js/web';
import { PageElement } from '@serenity-js/web';

export class TodoListItem {
    static label =
        // Target.the(`label`).located(by.css('label'));
        PageElement.locatedByCss(`label`).describedAs(`label`);

    static toggleButton =
        // Target.the(`toggle button`).located(by.css('input.toggle'));
        PageElement.locatedByCss(`input.toggle`).describedAs(`toggle button`);

    static destroyButton =
        // Target.the(`destroy button`).located(by.css('button.destroy'));
        PageElement.locatedByCss(`button.destroy`).describedAs(`destroy button`);

    static editItemNameInput =
        // Target.the(`edit item name input`).located(by.css('.edit'));
        PageElement.locatedByCss(`.edit`).describedAs(`edit item name input`);
}
