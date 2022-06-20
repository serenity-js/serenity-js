// import { by, Target } from '@serenity-js/web';   // Serenity/JS 2.x
import { By, PageElement } from '@serenity-js/web'; // Serenity/JS 3.x

export class TodoListItem {
    static label =
        // Target.the(`label`).located(by.css('label'));            // Serenity/JS 2.x
        PageElement.located(By.css(`label`)).describedAs(`label`);  // Serenity/JS 3.x

    static toggleButton =
        // Target.the(`toggle button`).located(by.css('input.toggle'));
        PageElement.located(By.css(`input.toggle`)).describedAs(`toggle button`);

    static destroyButton =
        // Target.the(`destroy button`).located(by.css('button.destroy'));
        PageElement.located(By.css(`button.destroy`)).describedAs(`destroy button`);

    static editItemNameInput =
        // Target.the(`edit item name input`).located(by.css('.edit'));
        PageElement.located(By.css(`.edit`)).describedAs(`edit item name input`);
}
