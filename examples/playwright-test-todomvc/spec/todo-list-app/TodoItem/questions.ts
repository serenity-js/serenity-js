import { By, PageElement } from '@serenity-js/web';

export const label = () =>
    PageElement
        .located(By.css('label'))
        .describedAs(`label`)

export const toggleButton = () =>
    PageElement
        .located(By.css('input.toggle'))
        .describedAs(`toggle button`)

export const destroyButton = () =>
    PageElement
        .located(By.css('button.destroy'))
        .describedAs(`destroy button`)

export const editor = () =>
    PageElement
        .located(By.css('li.editing .edit'))
        .describedAs(`todo item edit box`)
