import type { Question,QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class AboutView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    isVisible = (): Question<Promise<boolean>> =>
        this.child(By.css('.card'))
            .isPresent()
            .describedAs('whether the about view is visible');

    open = (): Task =>
        Task.where('#actor opens the About view',
            this.navigation.openView('About'),
        );
}
