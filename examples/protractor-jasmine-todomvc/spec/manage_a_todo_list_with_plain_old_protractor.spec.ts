import { browser, by, element, ExpectedConditions, protractor } from 'protractor';

describe('Todo List App', function () {

    // Test script style
    describe('test script', () => {

        it('allows for the list to show active items only', async function () {
            await browser.get('https://todo-app.serenity-js.org/#/');
            await browser.executeScript(`window.localStorage.clear()`);
            await browser.refresh();

            await element(by.css('.new-todo')).sendKeys('Play guitar');
            await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

            await element(by.css('.new-todo')).sendKeys('Read a book');
            await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

            await element(by.css('.new-todo')).sendKeys('Write some code');
            await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

            await element(
                by.xpath(`//li[*[@class='view' and contains(.,'Write some code')]]//input[contains(@class,'toggle')]`),
            )
                .click();

            await element(by.linkText(`Active`))
                .click();

            await element.all(by.css('.todo-list li')).getText().then(items => {
                expect(items).toEqual([
                    'Play guitar',
                    'Read a book',
                ]);
            });
        });
    });

    // Page Object(s) style
    describe('page objects', () => {

        const TodoListApp = {
            open: async () => {
                await browser.get('https://todo-app.serenity-js.org/#/');
                await browser.executeScript(`window.localStorage.clear()`);
                await browser.refresh();
                await browser.wait(ExpectedConditions.elementToBeClickable(element(by.css('.new-todo'))));
            },

            recordItemCalled: async (itemName: string) => {
                await element(by.css('.new-todo')).sendKeys(itemName);
                await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);
            },

            completeItemCalled: async (itemName: string) => {
                await element(
                    by.xpath(`//li[*[@class='view' and contains(.,'${ itemName }')]]//input[contains(@class,'toggle')]`),
                ).click();
            },

            filterToShowActiveItemsOnly: async () => {
                await element(by.linkText(`Active`))
                    .click();
            },

            recordedItems: async () => {
                return element.all(by.css('.todo-list li')).getText();
            },
        };

        it('allows for the list to show active items only', async function () {
            await TodoListApp.open();

            await TodoListApp.recordItemCalled('Play guitar');
            await TodoListApp.recordItemCalled('Read a book');
            await TodoListApp.recordItemCalled('Write some code');

            await TodoListApp.completeItemCalled('Write some code');

            await TodoListApp.filterToShowActiveItemsOnly();

            await TodoListApp.recordedItems().then(items => {
                expect(items).toEqual([
                    'Play guitar',
                    'Read a book',
                ]);
            });
        });
    });
});
