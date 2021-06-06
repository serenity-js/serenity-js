import { Text } from '@serenity-js/protractor';

import { TodoList } from './ui';

export const RecordedItems = (): any => Text.ofAll(TodoList.items);
