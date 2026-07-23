import type { Question, QuestionAdapter } from '@serenity-js/core';
import { By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class ErrorBlock<NET> extends InteractionObject<NET> {

    private errorName = () =>
        this.child(By.css('.error-name'))
            .describedAs('error name');

    private errorMessage = () =>
        this.child(By.css('.error-message'))
            .describedAs('error message');

    private errorStack = () =>
        this.child(By.css('.error-stack'))
            .describedAs('error stack trace');

    name = (): QuestionAdapter<string> =>
        this.errorName().text().trim()
            .describedAs('error name');

    message = (): QuestionAdapter<string> =>
        this.errorMessage().text().trim()
            .describedAs('error message');

    stackTrace = (): QuestionAdapter<string> =>
        this.errorStack().text().trim()
            .describedAs('error stack trace');

    hasLocation = (): Question<Promise<boolean>> =>
        this.child(By.css('.copy-location'))
            .isPresent()
            .describedAs('whether error block shows a source location');
}
