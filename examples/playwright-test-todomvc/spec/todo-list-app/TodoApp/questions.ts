import { includes } from '@serenity-js/assertions';
import { Answerable } from '@serenity-js/core';
import { By, PageElement, PageElements, Text } from '@serenity-js/web';

export const mainSection = () =>
    PageElement
        .located(By.css('.main'))
        .describedAs('main section');

export const footerSection = () =>
    PageElement
        .located(By.css('.footer'))
        .describedAs('footer section');

export const outstandingItemsLabel = () =>
    PageElement.located(By.css('.todo-count'))
        .describedAs('items left counter');

export const outstandingItemsCount = () =>
    Text.of(
        PageElement.located(By.tagName('strong'))
            .of(outstandingItemsLabel()),
    ).as(Number).describedAs('number of items left');

export const newTodoInput = () =>
    PageElement.located(By.css('.new-todo'))
        .describedAs('"What needs to be done?" input box');

export const clearCompletedButton = () =>
    PageElement.located(By.css('.clear-completed'))
        .describedAs('clear completed button');

export const filterCalled = (name: Answerable<string>) =>
    PageElements.located(By.css('.filters a'))
        .where(Text, includes(name))
        .first()
        .describedAs(`filter called ${ name }`);

export const toggleAllButton = () =>
    PageElement.located(By.id('toggle-all'))
        .describedAs('toggle all button');
