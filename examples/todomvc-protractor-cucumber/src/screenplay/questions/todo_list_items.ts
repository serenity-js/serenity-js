import { TodoList } from '../user_interface/todo_list';

import { BrowseTheWeb, Question, UsesAbilities } from 'serenity-js/lib/screenplay-protractor';

export class TodoListItems {
    static displayed() { return new TodoListItemsDisplayed(); };
}

export class TodoListItemsDisplayed implements Question<string[]> {
    answeredBy = (actor: UsesAbilities) => BrowseTheWeb.as(actor).locateAll(TodoList.Items).getText();
}
