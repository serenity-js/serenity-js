import ElementArrayFinder = protractor.ElementArrayFinder;

export class TodoList {
    public static What_Needs_To_Be_Done = by.id('new-todo');
    public static Items                 = by.repeater('todo in todos');
}