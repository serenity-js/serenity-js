import type { QuestionAdapter } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { Text } from '@serenity-js/web';

export class ResultCount<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    text = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('result count text');
}
