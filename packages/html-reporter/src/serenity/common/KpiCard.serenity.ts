import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class KpiCard<NET> extends InteractionObject<NET> {

    private labelElement = () =>
        this.child(By.css('.kpi-label'))
            .describedAs('KPI card label');

    private valueElement = () =>
        this.child(By.css('.kpi-value'))
            .describedAs('KPI card value');

    private subtitleElement = () =>
        this.child(By.css('.kpi-subtitle'))
            .describedAs('KPI card subtitle');

    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('KPI card label');

    value = (): QuestionAdapter<string> =>
        this.valueElement().text().trim()
            .describedAs('KPI card value');

    subtitle = (): QuestionAdapter<string> =>
        this.subtitleElement().text().trim()
            .describedAs('KPI card subtitle');

    accessibleLabel = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.rootElement)
            .describedAs('KPI card accessible label');
}
