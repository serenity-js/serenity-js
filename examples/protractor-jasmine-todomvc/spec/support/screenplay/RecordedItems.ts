import { Text } from '@serenity-js/web';

import { TodoList } from './ui';

export const RecordedItems = () => Text.ofAll(TodoList.items);
