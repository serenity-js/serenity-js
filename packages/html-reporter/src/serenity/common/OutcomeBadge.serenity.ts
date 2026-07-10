import type { QuestionAdapter } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Attribute, Text } from '@serenity-js/web';

export class OutcomeBadge<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    iconText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('outcome badge icon text');

    outcomeType = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.rootElement)
            .describedAs('outcome type');
}
