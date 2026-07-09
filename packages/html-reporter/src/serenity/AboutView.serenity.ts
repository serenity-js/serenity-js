import type { Answerable } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';

import { Navigation } from './Navigation.serenity.js';

export class AboutView<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    isVisible = (): Question<Promise<boolean>> =>
        Question.about('whether the about view content is visible', async actor => {
            const element = await actor.answer(this.rootElement);
            return element.isPresent();
        });

    open = (): Task =>
        Task.where('#actor opens the About view',
            this.navigation.openView('About'),
        );
}
