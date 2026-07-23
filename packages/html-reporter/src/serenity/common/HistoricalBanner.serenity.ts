import type { QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Attribute, By, Click, Text } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class HistoricalBanner<NET> extends InteractionObject<NET> {

    private strongElement = () =>
        this.child(By.css('strong'))
            .describedAs('run label');

    private subtitleElement = () =>
        this.child(By.css('.historical-banner-subtitle'))
            .describedAs('subtitle');

    private showLatestLink = () =>
        this.child(By.css('a.link-underline'))
            .describedAs('show latest link');

    text = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('banner text');

    runLabel = (): QuestionAdapter<string> =>
        Text.of(this.strongElement()).trim()
            .describedAs('run label text');

    subtitle = (): QuestionAdapter<string> =>
        Text.of(this.child(By.css('span'))).trim()
            .describedAs('banner subtitle area');

    showLatestLinkText = (): QuestionAdapter<string> =>
        Text.of(this.showLatestLink()).trim()
            .describedAs('show latest link text');

    showLatestLinkHref = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.showLatestLink())
            .describedAs('show latest link href');

    clickShowLatest = (): Task =>
        Task.where('#actor clicks show latest',
            Click.on(this.showLatestLink()),
        );
}
