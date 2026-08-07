import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';

export class AboutView<NET> extends InteractionObject<NET> {

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('about view body text');

    isVisible = (): Question<Promise<boolean>> =>
        this.child(By.css('.card'))
            .isPresent()
            .describedAs('whether the about view is visible');

    hasLinkTo = (url: string): Question<Promise<boolean>> =>
        this.child(By.css(`a[href="${url}"]`))
            .isPresent()
            .describedAs(`whether the about view has a link to ${url}`);

    open = (): Task =>
        Task.where('#actor opens the About view',
            this.navigation.openView('About'),
        );
}
