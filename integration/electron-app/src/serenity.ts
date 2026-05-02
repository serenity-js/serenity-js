import { By, PageElement } from '@serenity-js/web';

export const ElectronApp = {
    title: PageElement.located(By.css('h1')).describedAs('the app title'),
    description: PageElement.located(By.id('app-description')).describedAs('the app description'),

    // Button interaction section
    clickButton: PageElement.located(By.id('click-button')).describedAs('the click button'),
    clickCount: PageElement.located(By.id('click-count')).describedAs('the click count'),

    // Text input section
    textInput: PageElement.located(By.id('text-input')).describedAs('the text input'),
    inputResult: PageElement.located(By.id('input-result')).describedAs('the input result'),

    // Form submission section
    nameInput: PageElement.located(By.id('name-input')).describedAs('the name input'),
    submitButton: PageElement.located(By.id('submit-button')).describedAs('the submit button'),
    result: PageElement.located(By.id('result')).describedAs('the result message'),

    // Multi-window section
    openWindowButton: PageElement.located(By.id('open-window-button')).describedAs('the open window button'),
    windowStatus: PageElement.located(By.id('window-status')).describedAs('the window status'),
};
