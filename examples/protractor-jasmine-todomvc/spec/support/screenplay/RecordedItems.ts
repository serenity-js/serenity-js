import { Text } from '@serenity-js/protractor';
import { TodoList } from './ui';

export const RecordedItems = () => Text.ofAll(TodoList.items);
