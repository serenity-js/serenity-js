import { includes } from '@serenity-js/assertions';
import type { Question,QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class ScenarioItem<NET> extends InteractionObject<NET> {

    // Structure — page elements
    private readonly scenarioNameElement = this.child(By.css('.scenario-name')).describedAs('scenario name element');
    private readonly outcomeBadge = this.child(By.css('[data-testid="outcome-badge"]')).describedAs('outcome badge');
    private readonly tagChips = this.children(By.css('.tag-chip, .badge-link')).describedAs('tag chips');

    // Behaviour — questions

    name = (): QuestionAdapter<string> =>
        this.scenarioNameElement.text().trim()
            .describedAs('scenario name');

    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.outcomeBadge)
            .describedAs('scenario outcome');

    sourceLocation = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-source')).text().trim()
            .describedAs('scenario source location');

    errorPreview = (): QuestionAdapter<string> =>
        this.child(By.css('.scenario-error-preview')).text().trim()
            .describedAs('scenario error preview');

    isPresent = (): Question<Promise<boolean>> =>
        this.scenarioNameElement
            .isPresent()
            .describedAs('whether scenario is present');

    tagChipLabels = (): Question<Promise<string[]>> =>
        this.children(By.css('.tag-chip'))
            .eachMappedTo(Text)
            .describedAs('tag chip labels');

    // Behaviour — tasks

    clickTag = (name: string): Task =>
        Task.where(the`#actor clicks the ${name} tag`,
            Click.on(
                this.tagChips
                    .where(Text, includes(name))
                    .first()
                    .describedAs(the`tag chip ${name}`)
            ),
        );

    viewDetails = (): Task =>
        Task.where('#actor views scenario details',
            Click.on(this.scenarioNameElement),
        );
}
