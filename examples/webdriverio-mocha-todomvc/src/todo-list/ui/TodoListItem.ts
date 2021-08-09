import { by, Target } from '@serenity-js/webdriverio';

export class TodoListItem {
    static label =
        Target.the(`label`)
            .located(by.css('label'));

    static toggleButton =
        Target.the(`toggle button`)
            .located(by.css('input.toggle'));

    static destroyButton =
        Target.the(`destroy button`)
            .located(by.css('button.destroy'));

    static editItemNameInput =
        Target.the(`edit item name input`)
            .located(by.css('.edit'));
}
