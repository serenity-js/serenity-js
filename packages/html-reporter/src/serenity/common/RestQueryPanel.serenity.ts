import type { QuestionAdapter } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class RestQueryPanel<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    method = (): QuestionAdapter<string> =>
        PageElement.located(By.css('[data-testid="rest-method"]')).of(this.rootElement).text().trim()
            .describedAs('REST query HTTP method');

    url = (): QuestionAdapter<string> =>
        PageElement.located(By.css('[data-testid="rest-url"]')).of(this.rootElement).text().trim()
            .describedAs('REST query URL');

    statusCode = (): QuestionAdapter<string> =>
        PageElement.located(By.css('[data-testid="rest-status"]')).of(this.rootElement).text().trim()
            .describedAs('REST query status code');
}
