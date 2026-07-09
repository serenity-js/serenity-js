import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By } from '@serenity-js/web';

import { KpiCard } from './KpiCard.serenity.js';
import { View } from './View.serenity.js';

export class ErrorsView<NET> extends View<NET> {

    constructor(rootElement: Answerable<PageElement<NET>>) {
        super(rootElement);
    }

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.children(By.css('[data-testid="kpi-card"]')).nth(index));
}
