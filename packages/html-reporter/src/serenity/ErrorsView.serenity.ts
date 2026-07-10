import type { Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';
import { KpiCard } from './KpiCard.serenity.js';
import { Navigation } from './Navigation.serenity.js';

export class ErrorsView<NET> extends InteractionObject<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index));

    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
