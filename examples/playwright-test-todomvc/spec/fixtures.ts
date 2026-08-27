import { useFixtures } from '@serenity-js/playwright-test';
import { By, PageElement } from '@serenity-js/web';

import { TodoApp } from './todo-list-app/TodoApp';

interface TestFixtures {
    todoApp: TodoApp;
}

export const {
    describe,
    it,
    test,
    expect,
    beforeEach,
    afterEach,
} = useFixtures<TestFixtures>({
    todoApp: async ({}, use) => {
        const rootElement = PageElement.located(By.css('.todoapp'))
            .describedAs('todo app');
        await use(new TodoApp(rootElement));
    },
});
