import type { Answerable } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

export class RestQueryPanel<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    method = (): Question<Promise<string>> =>
        Question.about('REST query HTTP method', async actor => {
            const panel = await actor.answer(this.rootElement);
            const header = PageElement.located(By.css('.panel-section-border .font-semibold.font-mono')).of(panel);
            const element = await actor.answer(header);
            return (await element.text()).trim();
        });

    url = (): Question<Promise<string>> =>
        Question.about('REST query URL', async actor => {
            const panel = await actor.answer(this.rootElement);
            const urlElement = PageElement.located(By.css('.panel-section-border .font-mono.text-secondary')).of(panel);
            const element = await actor.answer(urlElement);
            return (await element.text()).trim();
        });

    statusCode = (): Question<Promise<string>> =>
        Question.about('REST query status code', async actor => {
            const panel = await actor.answer(this.rootElement);
            const statusElement = PageElement.located(By.css('.panel-section-border .ml-auto.font-semibold')).of(panel);
            const element = await actor.answer(statusElement);
            return (await element.text()).trim();
        });
}
