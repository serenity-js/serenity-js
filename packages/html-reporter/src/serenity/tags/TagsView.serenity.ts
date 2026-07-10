import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElements } from '@serenity-js/web';

import { Navigation } from '../common/Navigation.serenity.js';

export class TagsView<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
    }

    private tagCards = () =>
        PageElements.located(By.css('.tag-card'))
            .of(this.rootElement)
            .describedAs('tag cards');

    tagCount = (): Question<Promise<number>> =>
        this.tagCards().count().describedAs('number of tag cards');

    open = (): Task =>
        Task.where('#actor opens the Tags view',
            this.navigation.openView('Tags'),
        );
}
