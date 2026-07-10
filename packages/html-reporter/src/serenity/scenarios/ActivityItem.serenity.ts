import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By, PageElement } from '@serenity-js/web';

export class ActivityItem<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private activityIcon = () =>
        PageElement.located(By.css('.activity-icon'))
            .of(this.rootElement)
            .describedAs('activity icon');

    name = (): QuestionAdapter<string> =>
        PageElement.located(By.css('.activity-name')).of(this.rootElement).text().trim()
            .describedAs('activity name');

    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.activityIcon())
            .describedAs('activity outcome');
}
