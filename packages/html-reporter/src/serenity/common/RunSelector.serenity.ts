import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, Text, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class RunSelector<NET> extends InteractionObject<NET> {

    private selectElement = () =>
        this.child(By.css('select'))
            .describedAs('run selector dropdown');

    private showLatestLink = () =>
        this.child(By.css('.show-latest-link'))
            .describedAs('show latest link');

    selectedRun = (): QuestionAdapter<string> =>
        Value.of(this.selectElement())
            .describedAs('selected run timestamp');

    isHistorical = (): QuestionAdapter<boolean> =>
        Attribute.called('class').of(this.rootElement)
            .as(classes => (classes || '').includes('run-selector-row--historical'))
            .describedAs('whether viewing historical run');

    showLatestIsPresent = (): Question<Promise<boolean>> =>
        this.showLatestLink().isPresent()
            .describedAs('whether show latest link is present');

    showLatest = (): Task =>
        Task.where('#actor clicks show latest',
            Click.on(this.showLatestLink()),
        );

    showLatestLinkText = (): QuestionAdapter<string> =>
        Text.of(this.showLatestLink()).trim()
            .describedAs('show latest link text');

    showLatestLinkHref = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.showLatestLink())
            .describedAs('show latest link href');
}
