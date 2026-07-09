import type { Answerable } from '@serenity-js/core';
import { Question, Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElements } from '@serenity-js/web';

import { Navigation } from './Navigation.serenity.js';

export class TagsView<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    private tagCards = () =>
        PageElements.located(By.css('.tag-card'))
            .of(this.rootElement)
            .describedAs('tag cards');

    tagCount = (): Question<Promise<number>> =>
        Question.about('number of tag cards', async actor => {
            const elements = await actor.answer(this.tagCards());
            return elements.length;
        });

    open = (): Task =>
        Task.where('#actor opens the Tags view',
            this.navigation.openView('Tags'),
        );
}
