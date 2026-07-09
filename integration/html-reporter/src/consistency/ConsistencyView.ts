import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { ConsistencyView as ConsistencyViewBase } from '@serenity-js/html-reporter/serenity';
import { PageElement } from '@serenity-js/web';

import { Navigation } from '../app';

export class ConsistencyView<NET> extends ConsistencyViewBase<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    open = () =>
        Task.where(`#actor opens the Consistency view`,
            this.navigation.openView('Consistency'),
        )
}
