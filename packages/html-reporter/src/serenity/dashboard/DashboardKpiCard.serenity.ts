import type { Answerable } from '@serenity-js/core';
import { Interaction, Question, the } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class DashboardKpiCard<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    private labelElement = () =>
        PageElement.located(By.css('.kpi-label'))
            .of(this.rootElement)
            .describedAs('dashboard KPI card label');

    private valueElement = () =>
        PageElement.located(By.css('.kpi-value'))
            .of(this.rootElement)
            .describedAs('dashboard KPI card value');

    label = (): Question<Promise<string>> =>
        Question.about('dashboard KPI card label', async actor => {
            const element = await actor.answer(this.labelElement());
            return (await element.text()).trim();
        });

    value = (): Question<Promise<string>> =>
        Question.about('dashboard KPI card value', async actor => {
            const element = await actor.answer(this.valueElement());
            return (await element.text()).trim();
        });

    accessibleLabel = (): Question<Promise<string>> =>
        Question.about('dashboard KPI card accessible label', async actor => {
            const element = await actor.answer(this.rootElement);
            return (await element.attribute('aria-label')) || '';
        });

    click = (): Interaction =>
        Interaction.where(the`#actor clicks on the dashboard KPI card`, async actor => {
            const element = await actor.answer(this.rootElement);
            await element.click();
        });
}
