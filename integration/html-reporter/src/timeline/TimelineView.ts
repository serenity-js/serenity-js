import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { TimelineView as TimelineViewBase } from '@serenity-js/html-reporter/serenity';
import { PageElement } from '@serenity-js/web';

import { Navigation } from '../app';

export class TimelineView<NET> extends TimelineViewBase<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    open = () =>
        Task.where(`#actor opens the Timeline view`,
            this.navigation.openView('Timeline'),
        )
}
