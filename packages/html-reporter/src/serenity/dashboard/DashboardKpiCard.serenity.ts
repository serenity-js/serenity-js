import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class DashboardKpiCard<NET> extends InteractionObject<NET> {

    private labelElement = () =>
        this.child(By.css('.kpi-label'))
            .describedAs('dashboard KPI card label');

    private valueElement = () =>
        this.child(By.css('.kpi-value'))
            .describedAs('dashboard KPI card value');

    private subtitleElement = () =>
        this.child(By.css('.kpi-subtitle'))
            .describedAs('dashboard KPI card subtitle');

    label = (): QuestionAdapter<string> =>
        this.labelElement().text().trim()
            .describedAs('dashboard KPI card label');

    value = (): QuestionAdapter<string> =>
        this.valueElement().text().trim()
            .describedAs('dashboard KPI card value');

    subtitle = (): QuestionAdapter<string> =>
        this.subtitleElement().text().trim()
            .describedAs('dashboard KPI card subtitle');

    accessibleLabel = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.rootElement)
            .describedAs('dashboard KPI card accessible label');

    viewDetails = (): Task =>
        Task.where(the`#actor views KPI card details`,
            Click.on(this.rootElement),
        );
}
