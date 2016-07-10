import { BrowseTheWeb } from '../../../src/screenplay-protractor/abilities/browse_the_web';
import { UsesAbilities } from '../../../src/serenity/screenplay/actor';
import { Question } from '../../../src/serenity/screenplay/question';
import { TodoList } from '../user_interface/todo_list';

export class TodoListItems {
    static Displayed = new TodoListItemsDisplayed();
}

class TodoListItemsDisplayed implements Question<string[]> {

    answeredBy(actor: UsesAbilities): Promise<string[]> {
        // todo: clean up; the explicit creation of the Promise is messy
        return new Promise((resolve, reject) => {
            BrowseTheWeb.as(actor).findElements(TodoList.Items).getText().then(resolve, reject);
        });
    }
}
