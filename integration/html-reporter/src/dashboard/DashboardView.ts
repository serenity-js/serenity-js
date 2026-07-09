import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { DashboardView as DashboardViewBase } from '@serenity-js/html-reporter/serenity';
import { PageElement } from '@serenity-js/web';

import { Navigation } from '../app';

export class DashboardView<NET> extends DashboardViewBase<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    open = () =>
        Task.where(`#actor opens the Dashboard`,
            this.navigation.openView('Dashboard'),
        )
}
