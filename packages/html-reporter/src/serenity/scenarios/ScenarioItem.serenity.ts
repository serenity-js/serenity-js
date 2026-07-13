import type { Question,QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class ScenarioItem<NET> extends InteractionObject<NET> {

    private outcomeBadge = () =>
        this.child(By.css('[data-testid="outcome-badge"]'))
            .describedAs('outcome badge');

    name = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-name')).text().trim()
            .describedAs('scenario name');

    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.outcomeBadge())
            .describedAs('scenario outcome');

    sourceLocation = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-source')).text().trim()
            .describedAs('scenario source location');

    errorPreview = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-error-preview')).text().trim()
            .describedAs('scenario error preview');

    isPresent = (): Question<Promise<boolean>> =>
        this.child(By.css('.scenario-name'))
            .isPresent()
            .describedAs('whether scenario is present');

    viewDetails = (): Task =>
        Task.where('#actor views scenario details',
            Click.on(this.child(By.css('.scenario-name')).describedAs('scenario name')),
        );
}
