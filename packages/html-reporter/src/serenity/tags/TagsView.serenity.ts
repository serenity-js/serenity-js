import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class TagsView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private tagCards = () =>
        this.children(By.css('.tag-card'))
            .describedAs('tag cards');

    tagCount = (): Question<Promise<number>> =>
        this.tagCards().count().describedAs('number of tag cards');

    open = (): Task =>
        Task.where('#actor opens the Tags view',
            this.navigation.openView('Tags'),
        );
}
