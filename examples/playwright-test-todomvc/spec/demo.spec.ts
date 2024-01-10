import { Locator, Page } from '@playwright/test';
import { contain, Ensure } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { describe, expect, it } from '@serenity-js/playwright-test';
import { By, Enter, Key, Navigate, PageElement, PageElements, Press, Text } from '@serenity-js/web';

class TodoApp {
    private readonly page: Page
    private readonly newTodoInputBox: Locator
    public readonly recordedItems: Locator

    constructor(page: Page) {
        this.page = page
        this.newTodoInputBox = page.locator('.new-todo')
        this.recordedItems = page.locator('.view label')
    }

    async goto() {
        await this.page.goto('https://todo-app.serenity-js.org/#/');
    }

    async recordItem(name: string) {
        await this.newTodoInputBox.fill(name);
        await this.newTodoInputBox.press('Enter');
    }
}

class TodoAppV2 {
    private static readonly newTodoInputBox = () =>
        PageElement.located(By.css('.new-todo'))
            .describedAs('new todo input box')

    private static readonly recordedItems = () =>
        PageElements.located(By.css('.view label'))
            .describedAs('recorded items')

    static goto = () =>
        Task.where(`#actor opens the Todo App`,
            Navigate.to('https://todo-app.serenity-js.org/#/'),
        )

    static recordItem = (name: string) =>
        Task.where(`#actor records a todo item called "${ name }"`,
            Enter.theValue(name).into(this.newTodoInputBox()),
            Press.the(Key.Enter).in(this.newTodoInputBox()),
        )

    static recordedItemNames = () =>
        Text.ofAll(this.recordedItems())
}

describe('Todo App', () => {

    it('should allow me to add todo items using plain Playwright Test APIs', async ({ page }) => {

        await page.goto('https://todo-app.serenity-js.org/#/');

        await page.locator('.new-todo').fill('Walk the dog');

        await page.locator('.new-todo').press('Enter');

        await expect(page.locator('.view label')).toHaveText([
            'Walk the dog'
        ])
    })

    it('should allow me to add todo items using the Page Object pattern', async ({ page }) => {

        const app = new TodoApp(page);
        await app.goto();
        await app.recordItem('Walk the dog')

        await expect(app.recordedItems).toHaveText([
            'Walk the dog'
        ])
    })

    it('should allow me to add todo items using Playwright Test and Serenity/JS APIs', async ({ page, actor }) => {

        const newTodoInputBox = () => PageElement.from(page.locator('.new-todo'))
            .describedAs('new todo input box')
        const recordedItems = () => PageElements.located(By.css('.view label'))
            .describedAs('recorded items')

        await actor.attemptsTo(
            Navigate.to('https://todo-app.serenity-js.org/#/'),
            Enter.theValue('Walk the dog').into(newTodoInputBox()),
            Press.the(Key.Enter).in(newTodoInputBox()),

            Ensure.that(Text.ofAll(recordedItems()), contain('Walk the dog')),
        )
    })

    it('should allow me to add todo items using the Page Object pattern using Serenity/JS', async ({ actor }) => {

        await actor.attemptsTo(
            TodoAppV2.goto(),
            TodoAppV2.recordItem('Walk the dog'),

            Ensure.that(TodoAppV2.recordedItemNames(), contain('Walk the dog')),
        )
    })
})