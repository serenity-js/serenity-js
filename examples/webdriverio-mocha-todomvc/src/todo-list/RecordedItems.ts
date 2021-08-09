import { Text } from '@serenity-js/webdriverio';
import { TodoList } from './ui';
import { Question } from '@serenity-js/core';

export class RecordedItems {
    static names: Question<Promise<string[]>>   = Text.ofAll(TodoList.items);
    static count: Question<Promise<number>>     = TodoList.items.count();
}
