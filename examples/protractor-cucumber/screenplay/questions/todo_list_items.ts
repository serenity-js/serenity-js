import { TodoList } from '../user_interface/todo_list';

import { BrowseTheWeb } from 'serenity/lib/screenplay-protractor/abilities';
import { Question, UsesAbilities } from 'serenity/lib/serenity/screenplay';

export class TodoListItems {
    static displayed() { return new TodoListItemsDisplayed(); };
}

class TodoListItemsDisplayed implements Question<string[]> {
    answeredBy = (actor: UsesAbilities) => BrowseTheWeb.as(actor).locateAll(TodoList.Items).text();
}
