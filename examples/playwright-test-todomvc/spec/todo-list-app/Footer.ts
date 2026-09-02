import type { QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { By, Click, Text } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject';

export class Footer extends InteractionObject {

    private clearCompletedButton = () =>
        this.rootElement.element(By.css('.clear-completed'))
            .describedAs('clear completed button');

    // Questions

    outstandingItemsCount = () =>
        Text.of(
            this.rootElement.element(By.css('.todo-count strong')),
        ).as(Number).describedAs('number of items left');

    clearCompletedButtonText = (): QuestionAdapter<string> =>
        Text.of(this.clearCompletedButton())
            .describedAs('clear completed button text');

    canClearCompleted = () =>
        this.clearCompletedButton().isPresent()
            .describedAs('whether completed items can be cleared');

    // Tasks

    clearCompleted = (): Task =>
        Task.where('#actor clears completed items',
            Click.on(this.clearCompletedButton()),
        );
}
