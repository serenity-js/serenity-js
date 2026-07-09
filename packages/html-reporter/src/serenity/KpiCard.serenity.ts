import type { Answerable } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class KpiCard<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
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

    label = (): Question<Promise<string>> =>
        Question.about('KPI card label', async actor => {
            const element = await actor.answer(this.labelElement());
            return (await element.text()).trim();
        });

    value = (): Question<Promise<string>> =>
        Question.about('KPI card value', async actor => {
            const element = await actor.answer(this.valueElement());
            return (await element.text()).trim();
        });

    subtitle = (): Question<Promise<string>> =>
        Question.about('KPI card subtitle', async actor => {
            const element = await actor.answer(this.subtitleElement());
            return (await element.text()).trim();
        });

    accessibleLabel = (): Question<Promise<string>> =>
        Question.about('KPI card accessible label', async actor => {
            const element = await actor.answer(this.rootElement);
            return (await element.attribute('aria-label')) || '';
        });
}
