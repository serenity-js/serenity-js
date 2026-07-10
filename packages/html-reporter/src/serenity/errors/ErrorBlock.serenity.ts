import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class ErrorBlock<NET> {

    constructor(private readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    private errorName = () =>
        PageElement.located(By.css('.error-name'))
            .of(this.rootElement)
            .describedAs('error name');

    private errorMessage = () =>
        PageElement.located(By.css('.error-message'))
            .of(this.rootElement)
            .describedAs('error message');

    private errorStack = () =>
        PageElement.located(By.css('.error-stack'))
            .of(this.rootElement)
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
        Question.about('whether error block shows a source location', async actor => {
            const element = await actor.answer(this.rootElement);
            const locationElement = PageElement.located(By.css('.copy-location')).of(element);
            try {
                await actor.answer(locationElement);
                return true;
            } catch {
                return false;
            }
        });
}
