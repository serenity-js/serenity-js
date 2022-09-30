import { includes } from '@serenity-js/assertions';
import { Answerable, d, QuestionAdapter } from '@serenity-js/core';
import { By, PageElement, PageElements, Text } from '@serenity-js/web';

export const items = () =>
    PageElements.located(By.css('.todo-list li'))
        .describedAs('displayed items');

export const itemNames = () =>
    Text.ofAll(items())
        .map(name => name.trim())
        .describedAs('displayed items') as QuestionAdapter<string[]>;

export const itemCalled = (name: Answerable<string>) =>
    items()
        .where(Text, includes(name))
        .first()
        .describedAs(d`an item called ${ name }`) as QuestionAdapter<PageElement>;
