import type { QuestionAdapter } from '@serenity-js/core';
import { By } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class RestQueryPanel<NET> extends InteractionObject<NET> {

    method = (): QuestionAdapter<string> =>
        this.child(By.css('[data-testid="rest-method"]')).text().trim()
            .describedAs('REST query HTTP method');

    url = (): QuestionAdapter<string> =>
        this.child(By.css('[data-testid="rest-url"]')).text().trim()
            .describedAs('REST query URL');

    statusCode = (): QuestionAdapter<string> =>
        this.child(By.css('[data-testid="rest-status"]')).text().trim()
            .describedAs('REST query status code');
}
