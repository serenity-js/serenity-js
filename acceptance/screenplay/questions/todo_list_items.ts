import { BrowseTheWeb } from '../../../src/screenplay-protractor/abilities/browse_the_web';
import { UsesAbilities } from '../../../src/serenity/screenplay/actor';
import { Question } from '../../../src/serenity/screenplay/question';
import { TodoList } from '../user_interface/todo_list';

export class TodoListItems {
    static displayed() { return new TodoListItemsDisplayed(); };
}

class TodoListItemsDisplayed implements Question<string[]> {
    answeredBy = (actor: UsesAbilities) => BrowseTheWeb.as(actor).locateAll(TodoList.Items).getText();
}
