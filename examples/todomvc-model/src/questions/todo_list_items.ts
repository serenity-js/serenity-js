import { Question, Text } from 'serenity-js/lib/screenplay-protractor';

import { TodoList } from '../user_interface/todo_list';

export class TodoListItems {
    static Displayed: Question<string[]> = Text.ofAll(TodoList.Items);
}
