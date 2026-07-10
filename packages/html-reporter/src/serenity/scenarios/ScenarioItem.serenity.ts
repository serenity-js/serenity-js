import type { Question,QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, PageElement } from '@serenity-js/web';

export class ScenarioItem<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private outcomeBadge = () =>
        PageElement.located(By.css('[data-testid="outcome-badge"]'))
            .of(this.rootElement)
            .describedAs('outcome badge');

    name = (): QuestionAdapter<string> =>
        PageElement.located(By.css('.scenario-name')).of(this.rootElement).text().trim()
            .describedAs('scenario name');

    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.outcomeBadge())
            .describedAs('scenario outcome');

    sourceLocation = (): QuestionAdapter<string> =>
        PageElement.located(By.css('.scenario-source')).of(this.rootElement).text().trim()
            .describedAs('scenario source location');

    errorPreview = (): QuestionAdapter<string> =>
        PageElement.located(By.css('.scenario-error-preview')).of(this.rootElement).text().trim()
            .describedAs('scenario error preview');

    isPresent = (): Question<Promise<boolean>> =>
        PageElement.located(By.css('.scenario-name'))
            .of(this.rootElement)
            .isPresent()
            .describedAs('whether scenario is present');

    viewDetails = (): Task =>
        Task.where('#actor views scenario details',
            Click.on(this.rootElement),
        );
}
