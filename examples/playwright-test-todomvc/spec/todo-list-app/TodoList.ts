import { includes } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { d } from '@serenity-js/core';
import { By, Text } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject';
import { TodoItem } from './TodoItem';

export class TodoList extends InteractionObject {

    items = () =>
        this.rootElement.elements(By.css('li'))
            .describedAs('displayed items');

    // Questions

    itemNames = (): QuestionAdapter<string[]> =>
        Text.ofAll(this.items())
            .map(name => name.trim())
            .describedAs('displayed items') as QuestionAdapter<string[]>;

    itemCount = () =>
        this.items().count()
            .describedAs('number of displayed items');

    // Parameterised child

    itemCalled = (name: Answerable<string>): TodoItem => {
        const matchingItem = this.items()
            .where(Text, includes(name))
            .first()
            .describedAs(d`an item called ${name}`);
        return new TodoItem(matchingItem);
    };
}
