import type { Answerable } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class ErrorBlock<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
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

    name = (): Question<Promise<string>> =>
        Question.about('error name', async actor => {
            const element = await actor.answer(this.errorName());
            return (await element.text()).trim();
        });

    message = (): Question<Promise<string>> =>
        Question.about('error message', async actor => {
            const element = await actor.answer(this.errorMessage());
            return (await element.text()).trim();
        });

    stackTrace = (): Question<Promise<string>> =>
        Question.about('error stack trace', async actor => {
            const element = await actor.answer(this.errorStack());
            return (await element.text()).trim();
        });

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
