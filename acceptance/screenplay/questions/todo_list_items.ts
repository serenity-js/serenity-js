import { TodoList } from '../user_interface/todo_list';

export class TodoListItems {
    public static displayed(): webdriver.promise.Promise<string[]> {
        return element.all(TodoList.Items).getText();
    }
}
