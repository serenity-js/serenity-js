import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { ErrorsView as ErrorsViewBase } from '@serenity-js/html-reporter/serenity';
import { PageElement } from '@serenity-js/web';

import { Navigation } from '../app';

export class ErrorsView<NET> extends ErrorsViewBase<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    open = () =>
        Task.where(`#actor opens the Errors view`,
            this.navigation.openView('Errors'),
        )
}
