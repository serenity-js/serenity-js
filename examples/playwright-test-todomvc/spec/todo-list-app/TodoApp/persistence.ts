import { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

// models

export interface PersistedTodoItem {
    id: number;
    name: string;
    completed: boolean;
}

// questions

export const persistedItems = () =>
    Page.current()
        .executeScript(`
            return window.localStorage['serenity-js-todo-app']
                ? JSON.parse(window.localStorage['serenity-js-todo-app'])
                : []
        `)
        .describedAs('persisted items') as QuestionAdapter<PersistedTodoItem[]>;

export const persistedItemNames = () =>
    persistedItems()
        .map(item => item.name)
        .describedAs('persisted items') as QuestionAdapter<string[]>

export const persistedItemCalled = (name: Answerable<string>): QuestionAdapter<PersistedTodoItem> =>
    persistedItems()
        .find(item => item.name === name)
        .describedAs(`persisted item called ${ name }`)
