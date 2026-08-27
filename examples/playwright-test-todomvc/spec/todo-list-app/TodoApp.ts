import { contain, Ensure, equals, includes } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Task, Wait } from '@serenity-js/core';
import { HeadRequest, LastResponse, Send } from '@serenity-js/rest';
import { By, Click, CssClasses, Enter, Key, Navigate, Page, PageElement, PageElements, Press, Text, Value } from '@serenity-js/web';

import { Footer } from './Footer';
import { InteractionObject } from './InteractionObject';
import { TodoList } from './TodoList';

// Models

export interface PersistedTodoItem {
    id: number;
    name: string;
    completed: boolean;
}

export class TodoApp extends InteractionObject {

    readonly todoList = new TodoList(
        this.child(By.css('.todo-list')).describedAs('todo list'),
    );

    readonly footer = new Footer(
        this.child(By.css('.footer')).describedAs('footer'),
    );

    // Private elements

    private newTodoInput = () =>
        this.child(By.css('.new-todo'))
            .describedAs('"What needs to be done?" input box');

    private mainSection = () =>
        this.child(By.css('.main'))
            .describedAs('main section');

    private toggleAllButton = () =>
        PageElement.located(By.id('toggle-all'))
            .describedAs('toggle all button');

    private filterLinks = () =>
        PageElements.located(By.css('.filters a'))
            .describedAs('filter links');

    private filterCalled = (name: Answerable<string>) =>
        this.filterLinks()
            .where(Text, includes(name))
            .first()
            .describedAs(`filter called ${name}`);

    // Questions

    newTodoInputValue = (): QuestionAdapter<string> =>
        Value.of(this.newTodoInput())
            .describedAs('value of "What needs to be done?" input box');

    hasItems = () =>
        this.mainSection().isPresent()
            .describedAs('whether the list has items');

    outstandingItemsCount = () =>
        this.footer.outstandingItemsCount();

    canClearCompleted = () =>
        this.footer.canClearCompleted();

    allAreCompleted = (): QuestionAdapter<boolean> =>
        PageElement.located(By.css('#toggle-all:checked')).isPresent()
            .describedAs('whether all items are completed') as QuestionAdapter<boolean>;

    activeFilter = (): QuestionAdapter<string> =>
        Text.of(
            this.filterLinks()
                .where(CssClasses, contain('selected'))
                .first()
                .describedAs('active filter'),
        ).trim().describedAs('active filter name');

    persistedItems = () =>
        Page.current()
            .executeScript(`
                return window.localStorage['serenity-js-todo-app']
                    ? JSON.parse(window.localStorage['serenity-js-todo-app'])
                    : []
            `)
            .describedAs('persisted items') as QuestionAdapter<PersistedTodoItem[]>;

    persistedItemNames = () =>
        this.persistedItems()
            .map(item => item.name)
            .describedAs('persisted items') as QuestionAdapter<string[]>;

    persistedItemCalled = (name: Answerable<string>) =>
        this.persistedItems()
            .find(item => item.name === name)
            .describedAs(`persisted item called ${name}`) as QuestionAdapter<PersistedTodoItem>;

    // Tasks

    startWithAnEmptyList = (): Task =>
        Task.where('#actor starts with an empty todo list',
            Send.a(HeadRequest.to('/')),
            Ensure.that(LastResponse.status(), equals(200)),
            Navigate.to('/'),
            Ensure.that(
                Page.current().title().describedAs('website title'),
                equals('Serenity/JS TodoApp'),
            ),
        );

    startWithAListContaining = (...items: Array<Answerable<string>>): Task =>
        Task.where(`#actor starts with a list containing ${items.length} items`,
            this.startWithAnEmptyList(),
            ...items.map(item => this.recordItem(item)),
        );

    recordItem = (name: Answerable<string>): Task =>
        Task.where(`#actor records an item called ${name}`,
            Enter.theValue(name).into(this.newTodoInput()),
            Press.the(Key.Enter).in(this.newTodoInput()),
            Wait.until(this.todoList.itemNames(), contain(name)),
        );

    toggleAll = (): Task =>
        Task.where('#actor toggles all items',
            Click.on(this.toggleAllButton()),
        );

    clearCompleted = (): Task =>
        this.footer.clearCompleted();

    enableFilter = (state: 'All' | 'Active' | 'Completed'): Task =>
        Task.where(`#actor filters the list to show ${state.toLowerCase()} items`,
            Click.on(this.filterCalled(state)),
        );
}
