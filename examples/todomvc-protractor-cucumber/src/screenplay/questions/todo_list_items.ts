import { TodoList } from '../user_interface/todo_list';
import { Text } from 'serenity-js/lib/screenplay-protractor';

export class TodoListItems {
    static Displayed = Text.ofAll(TodoList.Items);
}
