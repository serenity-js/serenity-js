import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { TodoList } from './ui';

export class RecordedItems {
    static names: Question<Promise<string[]>>   = Text.ofAll(TodoList.items);
    static count: Question<Promise<number>>     = TodoList.items.count();
}
