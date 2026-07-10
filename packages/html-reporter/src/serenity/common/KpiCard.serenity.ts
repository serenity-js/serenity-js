import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By, PageElement } from '@serenity-js/web';

export class KpiCard<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private labelElement = () =>
        PageElement.located(By.css('.kpi-label'))
            .of(this.rootElement)
            .describedAs('KPI card label');

    private valueElement = () =>
        PageElement.located(By.css('.kpi-value'))
            .of(this.rootElement)
            .describedAs('KPI card value');

    private subtitleElement = () =>
        PageElement.located(By.css('.kpi-subtitle'))
            .of(this.rootElement)
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
