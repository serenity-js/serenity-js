import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { KpiCard } from '@serenity-js/html-reporter/serenity';
import { By, PageElement } from '@serenity-js/web';

import { Navigation, View } from '../app';

export class ErrorsView<NET> extends View<NET> {

    constructor(
        rootElement: Answerable<PageElement<NET>>,
        private readonly navigation: Navigation,
    ) {
        super(rootElement);
    }

    kpiCardAt = (index: number) =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index))

    open = () =>
        Task.where(`#actor opens the Errors view`,
            this.navigation.openView('Errors'),
        )
}
