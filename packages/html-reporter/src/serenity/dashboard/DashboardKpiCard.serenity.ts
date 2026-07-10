import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement } from '@serenity-js/web';

export class DashboardKpiCard<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private labelElement = () =>
        PageElement.located(By.css('.kpi-label'))
            .of(this.rootElement)
            .describedAs('dashboard KPI card label');

    private valueElement = () =>
        PageElement.located(By.css('.kpi-value'))
            .of(this.rootElement)
            .describedAs('dashboard KPI card value');

    private subtitleElement = () =>
        PageElement.located(By.css('.kpi-subtitle'))
            .of(this.rootElement)
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
